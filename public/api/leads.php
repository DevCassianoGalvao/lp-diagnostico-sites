<?php

declare(strict_types=1);

header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store');
header('X-Content-Type-Options: nosniff');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    json_response(['error' => 'method_not_allowed'], 405);
}

$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
$scheme = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') ? 'https' : 'http';
$expectedOrigin = $scheme . '://' . ($_SERVER['HTTP_HOST'] ?? '');
if ($origin !== '' && !hash_equals($expectedOrigin, $origin)) {
    json_response(['error' => 'invalid_origin'], 403);
}

$raw = file_get_contents('php://input');
if ($raw === false || strlen($raw) > 50000) {
    json_response(['error' => 'payload_too_large'], 413);
}

$payload = json_decode($raw, true);
if (!is_array($payload)) {
    json_response(['error' => 'invalid_json'], 400);
}

$lead = normalize_lead($payload);
if ($lead['errors']) {
    json_response(['error' => 'invalid_lead', 'fields' => $lead['errors']], 400);
}

if ($lead['website'] !== '') {
    json_response(['ok' => true, 'delivered' => false]);
}

if (rate_limited($_SERVER['REMOTE_ADDR'] ?? 'unknown')) {
    json_response(['error' => 'too_many_requests'], 429);
}

$config = load_brevo_config();
if ($config['api_key'] === '' || $config['sender_email'] === '' || $config['notification_email'] === '') {
    json_response(['ok' => true, 'delivered' => false]);
}

if (!function_exists('curl_init')) {
    json_response(['error' => 'curl_unavailable'], 500);
}

$email = build_lead_email($lead);
$brevoPayload = [
    'sender' => [
        'name' => $config['sender_name'],
        'email' => $config['sender_email'],
    ],
    'to' => [[
        'name' => $config['notification_name'],
        'email' => $config['notification_email'],
    ]],
    'replyTo' => [
        'name' => $lead['contact']['name'],
        'email' => $lead['contact']['email'],
    ],
    'subject' => $email['subject'],
    'htmlContent' => $email['html'],
    'tags' => ['diagnostico-site', $lead['phase']],
];

$curl = curl_init('https://api.brevo.com/v3/smtp/email');
curl_setopt_array($curl, [
    CURLOPT_POST => true,
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_CONNECTTIMEOUT => 8,
    CURLOPT_TIMEOUT => 20,
    CURLOPT_HTTPHEADER => [
        'Accept: application/json',
        'Content-Type: application/json',
        'api-key: ' . $config['api_key'],
    ],
    CURLOPT_POSTFIELDS => json_encode($brevoPayload, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES),
]);

$brevoResponse = curl_exec($curl);
$status = (int) curl_getinfo($curl, CURLINFO_HTTP_CODE);
$curlError = curl_error($curl);
curl_close($curl);

if ($brevoResponse === false || $status < 200 || $status >= 300) {
    error_log('Brevo lead notification failed. HTTP ' . $status . ' ' . $curlError);
    json_response(['error' => 'email_delivery_failed'], 502);
}

$brevoBody = json_decode($brevoResponse, true);
json_response([
    'ok' => true,
    'delivered' => true,
    'messageId' => is_array($brevoBody) ? ($brevoBody['messageId'] ?? 'sent') : 'sent',
]);

function load_brevo_config(): array
{
    $config = [
        'api_key' => getenv('BREVO_API_KEY') ?: '',
        'sender_email' => getenv('BREVO_SENDER_EMAIL') ?: '',
        'sender_name' => getenv('BREVO_SENDER_NAME') ?: 'Diagnostico Cassiano Galvao',
        'notification_email' => getenv('LEAD_NOTIFICATION_EMAIL') ?: '',
        'notification_name' => getenv('LEAD_NOTIFICATION_NAME') ?: 'Cassiano Galvao',
    ];

    $documentRoot = rtrim((string) ($_SERVER['DOCUMENT_ROOT'] ?? ''), '/\\');
    $privateConfig = dirname($documentRoot) . '/.config/cassiano-lp-brevo.php';
    if (is_file($privateConfig)) {
        $fileConfig = require $privateConfig;
        if (is_array($fileConfig)) {
            $config = array_merge($config, array_intersect_key($fileConfig, $config));
        }
    }

    return array_map(static function ($value): string {
        return trim((string) $value);
    }, $config);
}

function normalize_lead(array $payload): array
{
    $errors = [];
    $phase = in_array($payload['phase'] ?? '', ['started', 'completed'], true) ? $payload['phase'] : '';
    $leadId = clean_text($payload['leadId'] ?? '', 80);
    $contactPayload = is_array($payload['contact'] ?? null) ? $payload['contact'] : [];
    $contact = [
        'name' => clean_text($contactPayload['name'] ?? '', 80),
        'whatsapp' => clean_text($contactPayload['whatsapp'] ?? '', 24),
        'email' => strtolower(clean_text($contactPayload['email'] ?? '', 120)),
        'consent' => ($contactPayload['consent'] ?? false) === true,
    ];

    if ($phase === '') $errors[] = 'phase';
    if (!preg_match('/^[a-zA-Z0-9-]{8,80}$/', $leadId)) $errors[] = 'leadId';
    if (text_length($contact['name']) < 2) $errors[] = 'name';
    if (!preg_match('/^\d{10,14}$/', preg_replace('/\D/', '', $contact['whatsapp']))) $errors[] = 'whatsapp';
    if (!filter_var($contact['email'], FILTER_VALIDATE_EMAIL)) $errors[] = 'email';
    if (!$contact['consent']) $errors[] = 'consent';

    $answers = [];
    foreach (array_slice(is_array($payload['answers'] ?? null) ? $payload['answers'] : [], 0, 30) as $item) {
        if (!is_array($item)) continue;
        $question = clean_text($item['question'] ?? '', 140);
        $answer = clean_text($item['answer'] ?? '', 700);
        if ($question !== '' && $answer !== '') $answers[] = compact('question', 'answer');
    }

    $diagnosis = null;
    if (is_array($payload['diagnosis'] ?? null)) {
        $source = $payload['diagnosis'];
        $modules = [];
        foreach (array_slice(is_array($source['modules'] ?? null) ? $source['modules'] : [], 0, 12) as $module) {
            $value = clean_text($module, 160);
            if ($value !== '') $modules[] = $value;
        }
        $diagnosis = [
            'title' => clean_text($source['title'] ?? '', 240),
            'summary' => clean_text($source['summary'] ?? '', 1400),
            'challenge' => clean_text($source['challenge'] ?? '', 1000),
            'opportunity' => clean_text($source['opportunity'] ?? '', 1000),
            'recommendation' => clean_text($source['recommendation'] ?? '', 240),
            'recommendationBody' => clean_text($source['recommendationBody'] ?? '', 1400),
            'modules' => $modules,
        ];
    }

    if ($phase === 'completed' && ($diagnosis === null || !$answers)) $errors[] = 'diagnosis';

    return [
        'errors' => $errors,
        'phase' => $phase,
        'leadId' => $leadId,
        'contact' => $contact,
        'answers' => $answers,
        'diagnosis' => $diagnosis,
        'website' => clean_text($payload['website'] ?? '', 120),
    ];
}

function build_lead_email(array $lead): array
{
    $complete = $lead['phase'] === 'completed';
    $subject = $complete
        ? '[Diagnostico completo] ' . $lead['contact']['name']
        : '[Novo lead] ' . $lead['contact']['name'] . ' iniciou o diagnostico';

    $answerRows = '';
    foreach ($lead['answers'] as $item) {
        $answerRows .= '<tr><td style="padding:10px 12px;border-bottom:1px solid #e6e6e6;color:#666;font-size:13px;vertical-align:top">'
            . html($item['question']) . '</td><td style="padding:10px 12px;border-bottom:1px solid #e6e6e6;color:#151515;font-size:14px">'
            . html($item['answer']) . '</td></tr>';
    }

    $diagnosisHtml = '';
    if ($lead['diagnosis'] !== null) {
        $diagnosis = $lead['diagnosis'];
        $diagnosisHtml = '<h2 style="margin:28px 0 12px;font-size:20px;color:#151515">Diagnostico</h2>'
            . email_block('Leitura', $diagnosis['summary'])
            . email_block('Principal desafio', $diagnosis['challenge'])
            . email_block('Oportunidade', $diagnosis['opportunity'])
            . email_block('Recomendacao', $diagnosis['recommendation'] . ' - ' . $diagnosis['recommendationBody']);
        if ($diagnosis['modules']) {
            $diagnosisHtml .= email_block('Apoios possiveis', implode('; ', $diagnosis['modules']));
        }
    }

    $htmlContent = '<!doctype html><html><body style="margin:0;background:#f4f4f5;font-family:Arial,sans-serif;color:#151515">'
        . '<div style="max-width:720px;margin:0 auto;padding:28px 16px">'
        . '<div style="background:#08080b;border-top:4px solid #00ef9e;padding:24px;color:#fff">'
        . '<p style="margin:0 0 8px;color:#a954ff;font-size:12px;font-weight:700;text-transform:uppercase">'
        . ($complete ? 'Diagnostico concluido' : 'Novo contato capturado') . '</p>'
        . '<h1 style="margin:0;font-size:26px">' . html($lead['contact']['name']) . '</h1></div>'
        . '<div style="background:#fff;padding:24px"><h2 style="margin:0 0 14px;font-size:20px">Contato</h2>'
        . email_block('WhatsApp', $lead['contact']['whatsapp'])
        . email_block('E-mail', $lead['contact']['email'])
        . email_block('ID do lead', $lead['leadId'])
        . ($answerRows !== '' ? '<h2 style="margin:28px 0 12px;font-size:20px">Respostas</h2><table style="width:100%;border-collapse:collapse">' . $answerRows . '</table>' : '')
        . $diagnosisHtml . '</div></div></body></html>';

    return ['subject' => $subject, 'html' => $htmlContent];
}

function rate_limited(string $ip): bool
{
    $file = sys_get_temp_dir() . '/cassiano-lp-' . hash('sha256', $ip) . '.json';
    $now = time();
    $handle = fopen($file, 'c+');
    if ($handle === false) return false;
    flock($handle, LOCK_EX);
    $contents = stream_get_contents($handle);
    $times = json_decode($contents ?: '[]', true);
    if (!is_array($times)) $times = [];
    $times = array_values(array_filter($times, static function ($time) use ($now): bool {
        return is_int($time) && $now - $time < 600;
    }));
    $times[] = $now;
    ftruncate($handle, 0);
    rewind($handle);
    fwrite($handle, json_encode($times));
    fflush($handle);
    flock($handle, LOCK_UN);
    fclose($handle);
    return count($times) > 8;
}

function email_block(string $label, string $value): string
{
    return '<div style="margin:0 0 14px"><strong style="display:block;margin-bottom:4px;color:#666;font-size:12px;text-transform:uppercase">'
        . html($label) . '</strong><span style="font-size:15px;line-height:1.5">' . html($value) . '</span></div>';
}

function clean_text($value, int $max): string
{
    $text = trim((string) preg_replace('/\s+/u', ' ', strip_tags((string) $value)));
    return function_exists('mb_substr') ? mb_substr($text, 0, $max, 'UTF-8') : substr($text, 0, $max);
}

function text_length(string $value): int
{
    return function_exists('mb_strlen') ? mb_strlen($value, 'UTF-8') : strlen($value);
}

function html(string $value): string
{
    return htmlspecialchars($value, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');
}

function json_response(array $body, int $status = 200): void
{
    http_response_code($status);
    echo json_encode($body, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}

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

if (rate_limited(client_ip(), $lead['leadId'], $lead['phase'])) {
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
    'subject' => $email['subject'],
    'htmlContent' => $email['html'],
    'tags' => ['diagnostico-site', $lead['phase']],
];
if ($lead['contact']['email'] !== '') {
    $brevoPayload['replyTo'] = [
        'name' => $lead['contact']['name'],
        'email' => $lead['contact']['email'],
    ];
}

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
    $responseSummary = is_string($brevoResponse)
        ? substr((string) preg_replace('/\s+/', ' ', strip_tags($brevoResponse)), 0, 500)
        : '';
    error_log('Brevo lead notification failed. HTTP ' . $status . ' curl=' . $curlError . ' response=' . $responseSummary);
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
        'sender_name' => getenv('BREVO_SENDER_NAME') ?: 'Diagnóstico Cassiano Galvão',
        'notification_email' => getenv('LEAD_NOTIFICATION_EMAIL') ?: '',
        'notification_name' => getenv('LEAD_NOTIFICATION_NAME') ?: 'Cassiano Galvão',
    ];

    $documentRoot = rtrim((string) ($_SERVER['DOCUMENT_ROOT'] ?? ''), '/\\');
    $home = rtrim((string) (getenv('HOME') ?: ''), '/\\');
    $privateConfigs = array_unique(array_filter([
        $home !== '' ? $home . '/.config/cassiano-lp-brevo.php' : '',
        $documentRoot !== '' ? dirname($documentRoot) . '/.config/cassiano-lp-brevo.php' : '',
        dirname(__DIR__, 3) . '/.config/cassiano-lp-brevo.php',
    ]));

    foreach ($privateConfigs as $privateConfig) {
        if (is_file($privateConfig)) {
            $fileConfig = require $privateConfig;
            if (is_array($fileConfig)) {
                $config = array_merge($config, array_intersect_key($fileConfig, $config));
            }
            break;
        }
    }

    return array_map(static function ($value): string {
        return trim((string) $value);
    }, $config);
}

function normalize_lead(array $payload): array
{
    $errors = [];
    $phase = ($payload['phase'] ?? '') === 'completed' ? 'completed' : '';
    $leadId = clean_text($payload['leadId'] ?? '', 80);
    $contactPayload = is_array($payload['contact'] ?? null) ? $payload['contact'] : [];
    $contact = [
        'name' => clean_text($contactPayload['name'] ?? '', 80),
        'whatsapp' => clean_text($contactPayload['whatsapp'] ?? '', 24),
        'email' => strtolower(clean_text($contactPayload['email'] ?? '', 120)),
        'instagram' => normalize_instagram_handle($contactPayload['instagram'] ?? ''),
        'consent' => ($contactPayload['consent'] ?? false) === true,
    ];

    if ($phase === '') $errors[] = 'phase';
    if (!preg_match('/^[a-zA-Z0-9-]{8,80}$/', $leadId)) $errors[] = 'leadId';
    if (text_length($contact['name']) < 2) $errors[] = 'name';
    if (!preg_match('/^\d{10,14}$/', preg_replace('/\D/', '', $contact['whatsapp']))) $errors[] = 'whatsapp';
    if ($contact['email'] !== '' && !filter_var($contact['email'], FILTER_VALIDATE_EMAIL)) $errors[] = 'email';
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
            'indicators' => array_values(array_filter(array_map(static function ($value): string {
                return clean_text($value, 180);
            }, array_slice(is_array($source['indicators'] ?? null) ? $source['indicators'] : [], 0, 6)))),
            'offer' => clean_text($source['offer'] ?? '', 500),
        ];
    }

    $campaign = [];
    $allowedCampaign = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term', 'fbclid'];
    $campaignSource = is_array($payload['campaign'] ?? null) ? $payload['campaign'] : [];
    foreach ($allowedCampaign as $key) {
        $value = clean_text($campaignSource[$key] ?? '', 240);
        if ($value !== '') $campaign[$key] = $value;
    }

    if ($phase === 'completed' && ($diagnosis === null || !$answers)) $errors[] = 'diagnosis';

    return [
        'errors' => $errors,
        'phase' => $phase,
        'leadId' => $leadId,
        'contact' => $contact,
        'answers' => $answers,
        'diagnosis' => $diagnosis,
        'campaign' => $campaign,
        'timestamp' => clean_text($payload['timestamp'] ?? '', 60),
        'website' => clean_text($payload['website'] ?? '', 120),
    ];
}

function build_lead_email(array $lead): array
{
    $subject = 'Diagnóstico concluído: ' . $lead['contact']['name'];

    $answerRows = '';
    foreach ($lead['answers'] as $item) {
        $answerRows .= '<tr><td style="padding:10px 12px;border-bottom:1px solid #e6e6e6;color:#666;font-size:13px;vertical-align:top">'
            . html($item['question']) . '</td><td style="padding:10px 12px;border-bottom:1px solid #e6e6e6;color:#151515;font-size:14px">'
            . html($item['answer']) . '</td></tr>';
    }

    $diagnosisHtml = '';
    if ($lead['diagnosis'] !== null) {
        $diagnosis = $lead['diagnosis'];
        $diagnosisHtml = '<h2 style="margin:28px 0 12px;font-size:20px;color:#151515">Diagnóstico</h2>'
            . email_block('Leitura', $diagnosis['summary'])
            . email_block('Principal desafio', $diagnosis['challenge'])
            . email_block('Oportunidade', $diagnosis['opportunity'])
            . email_block('Recomendação', $diagnosis['recommendation'] . ' - ' . $diagnosis['recommendationBody']);
        if ($diagnosis['modules']) {
            $diagnosisHtml .= email_block('Apoios possíveis', implode('; ', $diagnosis['modules']));
        }
        if ($diagnosis['indicators']) {
            $diagnosisHtml .= email_block('Indicadores qualitativos', implode('; ', $diagnosis['indicators']));
        }
        if ($diagnosis['offer'] !== '') {
            $diagnosisHtml .= email_block('Oferta apresentada', $diagnosis['offer']);
        }
    }

    $campaignHtml = '';
    if ($lead['campaign']) {
        $campaignHtml = '<h2 style="margin:28px 0 12px;font-size:20px">Origem da campanha</h2>';
        foreach ($lead['campaign'] as $key => $value) $campaignHtml .= email_block(strtoupper(str_replace('_', ' ', $key)), $value);
    }

    $whatsappUrl = whatsapp_contact_url($lead['contact']['whatsapp'], $lead['contact']['name']);
    $instagramUrl = instagram_profile_url($lead['contact']['instagram']);
    $contactActions = '';
    if ($whatsappUrl !== '' || $instagramUrl !== '') {
        $contactActions = '<div style="margin:0 0 24px;padding:0 0 22px;border-bottom:1px solid #e6e6e6">'
            . '<p style="margin:0 0 10px;font-size:14px;color:#333">Atalhos para entrar em contato e conhecer o perfil deste lead.</p>'
            . '<table role="presentation" cellspacing="0" cellpadding="0" border="0"><tr>';
        if ($whatsappUrl !== '') {
            $contactActions .= '<td style="padding:0 8px 8px 0;vertical-align:top">'
                . '<a href="' . html($whatsappUrl) . '" style="display:block;padding:12px 16px;background:#00a884;color:#fff;text-decoration:none;font-size:14px;font-weight:700;line-height:18px;border-radius:4px;white-space:nowrap">'
                . '<img src="https://cassianogalvao.com.br/lp/assets/icons/whatsapp.svg" width="17" height="17" alt="" style="display:inline-block;margin:0 7px 0 0;border:0;vertical-align:middle">'
                . '<span style="vertical-align:middle">Abrir WhatsApp</span></a></td>';
        }
        if ($instagramUrl !== '') {
            $contactActions .= '<td style="padding:0 0 8px;vertical-align:top">'
                . '<a href="' . html($instagramUrl) . '" style="display:block;padding:12px 16px;background:#c13584;background-image:linear-gradient(90deg,#833ab4,#c13584,#e1306c);color:#fff;text-decoration:none;font-size:14px;font-weight:700;line-height:18px;border-radius:4px;white-space:nowrap">'
                . '<img src="https://cassianogalvao.com.br/lp/assets/icons/instagram.svg" width="17" height="17" alt="" style="display:inline-block;margin:0 7px 0 0;border:0;vertical-align:middle">'
                . '<span style="vertical-align:middle">Abrir Instagram</span></a></td>';
        }
        $contactActions .= '</tr></table></div>';
    }

    $htmlContent = '<!doctype html><html lang="pt-BR"><head><meta charset="UTF-8"></head><body style="margin:0;background:#f4f4f5;font-family:Arial,sans-serif;color:#151515">'
        . '<div style="max-width:720px;margin:0 auto;padding:28px 16px">'
        . '<div style="background:#08080b;border-top:4px solid #00ef9e;padding:24px;color:#fff">'
        . '<p style="margin:0 0 8px;color:#a954ff;font-size:12px;font-weight:700;text-transform:uppercase">'
        . 'Diagnóstico concluído</p>'
        . '<h1 style="margin:0;font-size:26px">' . html($lead['contact']['name']) . '</h1></div>'
        . '<div style="background:#fff;padding:24px">' . $contactActions . '<h2 style="margin:0 0 14px;font-size:20px">Contato</h2>'
        . email_block('WhatsApp', $lead['contact']['whatsapp'])
        . ($lead['contact']['email'] !== '' ? email_block('E-mail', $lead['contact']['email']) : '')
        . ($lead['contact']['instagram'] !== '' ? email_block('Instagram', '@' . $lead['contact']['instagram']) : '')
        . email_block('ID do lead', $lead['leadId'])
        . ($answerRows !== '' ? '<h2 style="margin:28px 0 12px;font-size:20px">Respostas</h2><table style="width:100%;border-collapse:collapse">' . $answerRows . '</table>' : '')
        . $diagnosisHtml . $campaignHtml . '</div></div></body></html>';

    return ['subject' => $subject, 'html' => $htmlContent];
}

function whatsapp_contact_url(string $phone, string $name): string
{
    $digits = (string) preg_replace('/\D/', '', $phone);
    if (strlen($digits) === 10 || strlen($digits) === 11) {
        $digits = '55' . $digits;
    }
    if (!preg_match('/^\d{12,14}$/', $digits)) return '';

    $message = 'Olá, ' . $name . '! Aqui é o Cassiano Galvão. Recebi seu diagnóstico pelo meu site e gostaria de entender melhor o seu projeto. Podemos conversar?';
    return 'https://wa.me/' . $digits . '?text=' . rawurlencode($message);
}

function normalize_instagram_handle($value): string
{
    $raw = trim((string) $value);
    if ($raw === '') return '';

    $candidate = preg_replace('#^https?://#i', '', $raw);
    $candidate = preg_replace('#^(www\.)?instagram\.com/#i', '', (string) $candidate);
    $candidate = ltrim((string) $candidate, '@');
    $candidate = explode('/', $candidate)[0];
    $candidate = explode('?', $candidate)[0];
    $candidate = explode('#', $candidate)[0];

    return preg_match('/^[a-zA-Z0-9._]{1,30}$/', $candidate) ? $candidate : '';
}

function instagram_profile_url(string $handle): string
{
    return $handle !== '' ? 'https://www.instagram.com/' . rawurlencode($handle) . '/' : '';
}

function client_ip(): string
{
    $candidates = [
        $_SERVER['HTTP_CF_CONNECTING_IP'] ?? '',
        $_SERVER['REMOTE_ADDR'] ?? '',
    ];
    foreach ($candidates as $candidate) {
        if (filter_var($candidate, FILTER_VALIDATE_IP)) return $candidate;
    }
    return 'unknown';
}

function rate_limited(string $ip, string $leadId, string $phase): bool
{
    $file = sys_get_temp_dir() . '/cassiano-lp-' . hash('sha256', $ip . '|' . $leadId . '|' . $phase) . '.json';
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
    return count($times) > 5;
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

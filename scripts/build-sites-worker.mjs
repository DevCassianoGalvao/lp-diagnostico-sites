import { copyFile, mkdir, readdir, rename } from "node:fs/promises";

await mkdir("dist/client", { recursive: true });
const entries = await readdir("dist", { withFileTypes: true });

for (const entry of entries) {
  if (["client", "server", ".openai"].includes(entry.name)) continue;
  await rename(`dist/${entry.name}`, `dist/client/${entry.name}`);
}

await mkdir("dist/server", { recursive: true });
await copyFile("worker/index.js", "dist/server/index.js");

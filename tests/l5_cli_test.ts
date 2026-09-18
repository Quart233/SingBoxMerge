import { assertEquals } from "jsr:@std/assert";

import { sampleNodes, sampleTemplate, writeJsonFixture } from "./helpers.ts";

const main = new URL("../main.ts", import.meta.url).pathname;

async function runMain(args: string[]) {
  const command = new Deno.Command(Deno.execPath(), {
    args: ["run", "--allow-read", "--allow-net", main, ...args],
    stdout: "piped",
    stderr: "piped",
  });
  const output = await command.output();
  return {
    code: output.code,
    stdout: new TextDecoder().decode(output.stdout),
    stderr: new TextDecoder().decode(output.stderr),
  };
}

async function withFixtures() {
  const dir = await Deno.makeTempDir();
  const subscription = await writeJsonFixture(dir, "nodes.json", sampleNodes());
  const template = await writeJsonFixture(dir, "tpl.json", sampleTemplate());
  return { subscription, template };
}

Deno.test("L5 --help exits 0 without I/O", async () => {
  const result = await runMain(["--help"]);
  assertEquals(result.code, 0);
  assertEquals(result.stdout.includes("Usage:"), true);
  assertEquals(result.stdout.includes("--subscription"), true);
});

Deno.test("L5 invalid command exits 1", async () => {
  const result = await runMain([]);
  assertEquals(result.code, 1);
  assertEquals(result.stderr.includes("Invalid command"), true);
});

Deno.test("L5 generate prints JSON with outbounds", async () => {
  const { subscription, template } = await withFixtures();
  const result = await runMain([
    "generate",
    "-t",
    template,
    "-s",
    subscription,
  ]);

  assertEquals(result.code, 0);
  const config = JSON.parse(result.stdout);
  const tags = config.outbounds.map((o: { tag: string }) => o.tag);
  assertEquals(tags.includes("proxy"), true);
  assertEquals(tags.includes("Youtube"), true);
  assertEquals(tags.includes("Japan | tokyo"), true);
});

Deno.test("L5 server returns the generated JSON", async () => {
  const { subscription, template } = await withFixtures();
  const port = 20000 + Math.floor(Math.random() * 10000);
  const command = new Deno.Command(Deno.execPath(), {
    args: [
      "run",
      "--allow-read",
      "--allow-net",
      main,
      "server",
      "-p",
      String(port),
      "-l",
      "127.0.0.1",
      "-t",
      template,
      "-s",
      subscription,
    ],
    stdout: "null",
    stderr: "null",
  });
  const child = command.spawn();

  try {
    const deadline = Date.now() + 8000;
    let res: Response | undefined;
    while (Date.now() < deadline) {
      try {
        res = await fetch(`http://127.0.0.1:${port}/`);
        break;
      } catch {
        await new Promise((resolve) => setTimeout(resolve, 50));
      }
    }
    if (!res) {
      throw new Error(`server did not start on port ${port}`);
    }
    assertEquals(res.status, 200);
    assertEquals(
      res.headers.get("content-type")?.includes("application/json"),
      true,
    );
    const config = await res.json();
    const tags = config.outbounds.map((o: { tag: string }) => o.tag);
    assertEquals(tags.includes("proxy"), true);
    assertEquals(tags.includes("src") || tags.includes("auska"), true);
  } finally {
    child.kill("SIGTERM");
    await child.status;
  }
});

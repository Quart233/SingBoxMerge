import { pathToFileURL } from "node:url";
import { assertEquals, assertRejects } from "jsr:@std/assert";

import { loadData } from "../utils/file.ts";

Deno.test("L2 loadData: file:// reads disk", async () => {
  const dir = await Deno.makeTempDir();
  const path = `${dir}/data.txt`;
  await Deno.writeTextFile(path, "hello-file");
  const text = await loadData(pathToFileURL(path).href);
  assertEquals(text, "hello-file");
});

Deno.test("L2 loadData: HTTP success", async () => {
  const server = Deno.serve({ hostname: "127.0.0.1", port: 0 }, () => {
    return new Response("hello-http");
  });
  const addr = server.addr as Deno.NetAddr;
  try {
    const text = await loadData(`http://${addr.hostname}:${addr.port}/`);
    assertEquals(text, "hello-http");
  } finally {
    await server.shutdown();
  }
});

Deno.test("L2 loadData: HTTP non-2xx throws", async () => {
  const server = Deno.serve({ hostname: "127.0.0.1", port: 0 }, () => {
    return new Response("nope", { status: 500, statusText: "Boom" });
  });
  const addr = server.addr as Deno.NetAddr;
  try {
    await assertRejects(
      () => loadData(`http://${addr.hostname}:${addr.port}/`),
      Error,
      "Failed to fetch",
    );
  } finally {
    await server.shutdown();
  }
});

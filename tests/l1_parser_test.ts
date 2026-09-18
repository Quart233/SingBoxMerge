import { Buffer } from "node:buffer";
import { assertEquals, assertThrows } from "jsr:@std/assert";

import { Protocol } from "../outbounds/mod.ts";
import { parseBase64, parseJson } from "../parsers/mod.ts";
import { withWarnCapture } from "./helpers.ts";

function encodeUris(uris: string[]) {
  return Buffer.from(uris.join("\n")).toString("base64");
}

Deno.test("L1 parseJson: routes known types and drops unknown", async () => {
  const { value, warnings } = await withWarnCapture(() =>
    parseJson({
      outbounds: [
        {
          type: "vless",
          tag: "a",
          server: "1.1.1.1",
          server_port: 443,
          uuid: "u",
        },
        { type: "wireguard", tag: "wg" },
        {
          type: "shadowsocks",
          tag: "b",
          server: "2.2.2.2",
          server_port: 8388,
          method: "aes-256-gcm",
          password: "p",
        },
      ],
    })
  );

  assertEquals(value.map((o) => o.config.tag), ["a", "b"]);
  assertEquals(value.map((o) => o.config.type), [
    Protocol.Vless,
    Protocol.Shadowsocks,
  ]);
  assertEquals(warnings.length, 1);
  assertEquals(warnings[0].includes("wireguard"), true);
});

Deno.test("L1 parseJson: empty or missing outbounds returns []", () => {
  assertEquals(parseJson({}), []);
  assertEquals(parseJson({ outbounds: [] }), []);
  assertEquals(parseJson("{\"foo\":1}"), []);
});

Deno.test("L1 parseJson: invalid JSON throws", () => {
  assertThrows(() => parseJson("not-json"));
});

Deno.test("L1 parseBase64: mixed lines, blanks, unknown scheme", async () => {
  const user = Buffer.from("aes-256-gcm:secret").toString("base64");
  const ss = `ss://${user}@example.com:8388#ss-1`;
  const vless = "vless://u-1@vless.example:443#vl-1";
  const raw = encodeUris(["", ss, "xxx://nope", vless, "   "]);

  const { value, warnings } = await withWarnCapture(() => parseBase64(raw));

  assertEquals(value.map((o) => o.config.tag), ["ss-1", "vl-1"]);
  assertEquals(value.map((o) => o.config.type), [
    Protocol.Shadowsocks,
    Protocol.Vless,
  ]);
  assertEquals(warnings.length, 1);
  assertEquals(warnings[0].includes("xxx"), true);
});

Deno.test("L1 parseBase64: empty payload returns []", () => {
  assertEquals(parseBase64(""), []);
});

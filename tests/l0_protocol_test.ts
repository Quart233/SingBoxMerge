import { Buffer } from "node:buffer";
import { assertEquals, assertThrows } from "jsr:@std/assert";

import { Base, Protocol } from "../outbounds/mod.ts";
import { Shadowsocks } from "../parsers/shadowsocks.ts";
import { Vmess } from "../parsers/vmess.ts";
import { Vless } from "../parsers/vless.ts";
import { Trojan } from "../parsers/trojan.ts";

Deno.test("L0 Base: missing type or tag throws", () => {
  assertThrows(
    () => new Base({ type: Protocol.Vless, tag: "" }),
    Error,
    "missing required fields",
  );
});

Deno.test("L0 Base: group toConfig uses child tags", () => {
  const a = new Base({ type: Protocol.Vless, tag: "n1" });
  const group = new Base({ type: Protocol.Selector, tag: "g" }, [a]);
  assertEquals(group.toConfig(), {
    type: Protocol.Selector,
    tag: "g",
    outbounds: ["n1"],
  });
});

Deno.test("L0 Base: leaf toConfig returns config", () => {
  const node = new Base({ type: Protocol.Vless, tag: "n1" });
  assertEquals(node.toConfig(), { type: Protocol.Vless, tag: "n1" });
});

Deno.test("L0 Shadowsocks: fromURI and fromJSON", () => {
  const user = Buffer.from("aes-256-gcm:secret").toString("base64");
  const uri = `ss://${user}@example.com:8388#${encodeURIComponent("Japan | ss")}`;
  const fromUri = Shadowsocks.fromURI(uri).toConfig() as unknown;

  assertEquals(fromUri, {
    type: Protocol.Shadowsocks,
    tag: "Japan | ss",
    method: "aes-256-gcm",
    password: "secret",
    server: "example.com",
    server_port: 8388,
  });

  const fromJson = Shadowsocks.fromJSON({
    type: Protocol.Shadowsocks,
    tag: "ss-json",
    method: "aes-256-gcm",
    password: "secret",
    server: "example.com",
    server_port: 8388,
  }).toConfig();

  assertEquals(fromJson.tag, "ss-json");
  assertEquals(fromJson.type, Protocol.Shadowsocks);
});

Deno.test("L0 Shadowsocks: fromJSON missing tag throws", () => {
  assertThrows(
    () =>
      Shadowsocks.fromJSON({
        type: Protocol.Shadowsocks,
        tag: "",
        method: "aes-256-gcm",
        password: "secret",
        server: "example.com",
        server_port: 8388,
      }),
    Error,
    "missing required fields",
  );
});

Deno.test("L0 Vmess: fromURI and fromJSON", () => {
  const payload = {
    add: "1.2.3.4",
    ps: "vmess-1",
    id: "11111111-1111-1111-1111-111111111111",
    scy: "auto",
    aid: 0,
    port: 443,
  };
  const uri = `vmess://${Buffer.from(JSON.stringify(payload)).toString("base64")}`;
  const fromUri = Vmess.fromURI(uri).toConfig() as unknown as Record<
    string,
    unknown
  >;

  assertEquals(fromUri.tag, "vmess-1");
  assertEquals(fromUri.type, Protocol.Vmess);
  assertEquals(fromUri.server, "1.2.3.4");
  assertEquals(fromUri.server_port, 443);
  assertEquals(fromUri.uuid, payload.id);
  assertEquals(fromUri.security, "auto");
  assertEquals(fromUri.alter_id, 0);
  assertEquals(fromUri.transport, {});

  const fromJson = Vmess.fromJSON({
    type: Protocol.Vmess,
    tag: "vmess-json",
    uuid: payload.id,
    server: "1.2.3.4",
    server_port: 443,
    security: "auto",
    alter_id: 0,
  }).toConfig() as unknown as Record<string, unknown>;

  assertEquals(fromJson.tag, "vmess-json");
  assertEquals(fromJson.transport, {});
});

Deno.test("L0 Vmess: missing server throws", () => {
  assertThrows(
    () =>
      Vmess.fromJSON({
        type: Protocol.Vmess,
        tag: "bad",
        uuid: "id",
        server: "",
        server_port: 443,
        security: "auto",
        alter_id: 0,
      }),
    Error,
    "missing required fields",
  );
});

Deno.test("L0 Vless: fromURI and fromJSON", () => {
  const uri =
    "vless://u-1@vless.example:443?flow=xtls-rprx-vision&sni=sni.example&fp=firefox&pbk=PUB&sid=abcd#node";
  const fromUri = Vless.fromURI(uri).toConfig() as unknown as Record<
    string,
    unknown
  >;
  const tls = fromUri.tls as Record<string, unknown>;

  assertEquals(fromUri.tag, "node");
  assertEquals(fromUri.type, Protocol.Vless);
  assertEquals(fromUri.server, "vless.example");
  assertEquals(fromUri.server_port, 443);
  assertEquals(fromUri.uuid, "u-1");
  assertEquals(fromUri.flow, "xtls-rprx-vision");
  assertEquals(tls.enabled, true);
  assertEquals(tls.server_name, "sni.example");
  assertEquals((tls.utls as Record<string, unknown>).fingerprint, "firefox");
  assertEquals((tls.reality as Record<string, unknown>).public_key, "PUB");

  const fromJson = Vless.fromJSON({
    type: Protocol.Vless,
    tag: "vless-json",
    server: "vless.example",
    server_port: 443,
    uuid: "u-1",
  }).toConfig();

  assertEquals(fromJson.tag, "vless-json");
});

Deno.test("L0 Trojan: fromURI and fromJSON", () => {
  const uri = "trojan://secret@trojan.example:443?sni=sni.example&allowInsecure=1#tj";
  const fromUri = Trojan.fromURI(uri).toConfig() as unknown as Record<
    string,
    unknown
  >;
  const tls = fromUri.tls as Record<string, unknown>;

  assertEquals(fromUri, {
    type: Protocol.Trojan,
    tag: "tj",
    password: "secret",
    server: "trojan.example",
    server_port: 443,
    network: "tcp",
    tls: {
      enabled: true,
      insecure: true,
      server_name: "sni.example",
    },
  });
  assertEquals(tls.insecure, true);

  const fromJson = Trojan.fromJSON({
    type: Protocol.Trojan,
    tag: "tj-json",
    server: "trojan.example",
    server_port: 443,
    password: "secret",
    network: "tcp",
    tls: { enabled: true },
  }).toConfig();

  assertEquals(fromJson.tag, "tj-json");
});

import { Buffer } from "node:buffer";

import { IOutbound, Protocol } from "../outbounds/mod.ts";
import { Shadowsocks, type Config as ShadowsocksConfig } from "./shadowsocks.ts";
import { Vmess, type Config as VmessConfig } from "./vmess.ts";
import { Vless, type Config as VlessConfig } from "./vless.ts";
import { Trojan, type Config as TrojanConfig } from "./trojan.ts";

export { Shadowsocks } from "./shadowsocks.ts";
export { Vmess } from "./vmess.ts";
export { Vless } from "./vless.ts";
export { Trojan } from "./trojan.ts";

export enum URI {
  Vmess = "vmess",
  Vless = "vless",
  Trojan = "trojan",
  Shadowsocks = "ss",
}

export interface ProviderRes {
  outbounds: Array<
    ShadowsocksConfig | VmessConfig | VlessConfig | TrojanConfig
  >;
}

type Config = ShadowsocksConfig | VmessConfig | VlessConfig | TrojanConfig;
type Proto =
  | Protocol.Shadowsocks
  | Protocol.Vmess
  | Protocol.Vless
  | Protocol.Trojan;

const ProtocolFactory = {
  [Protocol.Shadowsocks]: Shadowsocks,
  [Protocol.Vmess]: Vmess,
  [Protocol.Vless]: Vless,
  [Protocol.Trojan]: Trojan,
} as const;

const URISchemaFactory = {
  [URI.Shadowsocks]: Shadowsocks,
  [URI.Vmess]: Vmess,
  [URI.Vless]: Vless,
  [URI.Trojan]: Trojan,
} as const;

function fromUri(uri: string): IOutbound | undefined {
  const schema = uri.split("://")[0] as URI;
  const Ctor = URISchemaFactory[schema];

  if (!Ctor) {
    console.warn(`[Parser] 不支持的协议类型: ${schema}`);
    return undefined;
  }

  return Ctor.fromURI(uri);
}

function fromJSON(json: Config): IOutbound | undefined {
  const Ctor = ProtocolFactory[json.type as Proto];

  if (!Ctor) {
    console.warn(`[Parser] 不支持的协议类型: ${json.type}`);
    return undefined;
  }

  return Ctor.fromJSON(json as never);
}

export function parseBase64(text: string) {
  const decoded = Buffer.from(text, "base64")
    .toString("utf8")
    .split("\n")
    .map((uri: string) => uri.trim())
    .filter((uri: string) => uri != null && uri.includes("://"));

  return decoded
    .map(fromUri)
    .filter((o): o is IOutbound => o !== undefined);
}

export function parseJson(raw: string | object) {
  const json = typeof raw === "string" ? JSON.parse(raw) : raw;
  if (!json?.outbounds || !Array.isArray(json.outbounds)) {
    return [];
  }

  return (json.outbounds as Config[])
    .map(fromJSON)
    .filter((o): o is IOutbound => o !== undefined);
}

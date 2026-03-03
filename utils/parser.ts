import { Buffer } from "node:buffer";

import {
  URI,
  Protocol,
  Shadowsocks,
  Vmess,
  Trojan,
  Vless,
  ProviderRes
} from "../outbounds/mod.ts";
import { IOutbound } from "../outbounds/base.ts";

import type { Config as ShadowsocksConfig } from "../outbounds/shadowsocks.ts"
import type { Config as VmessConfig } from "../outbounds/vmess.ts"
import type { Config as VlessConfig }  from "../outbounds/vless.ts"
import type { Config as TrojanConfig } from "../outbounds/trojan.ts"

type Config = ShadowsocksConfig | VmessConfig | VlessConfig | TrojanConfig
type Proto = Protocol.Shadowsocks | Protocol.Vmess | Protocol.Vless | Protocol.Trojan

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

// 先定义一个抽象的解析策略接口
interface SubscriptionParser {
  parseBase64(text: string): IOutbound[];
  parseJson(json: ProviderRes): IOutbound[];
}

// 实际的协议分发逻辑（可复用）
function fromUri(uri: string): IOutbound | undefined {
  const schema = uri.split("://")[0]  as URI;
  const Ctor = URISchemaFactory[schema];

  if (!Ctor) {
    console.warn(`[Outbound] 不支持的协议类型: ${schema}`);
    return undefined;
  }

  return Ctor.fromURI(uri)
}

function fromJSON(json: Config): IOutbound | undefined {
  const Ctor = ProtocolFactory[json.type as Proto];

  if (!Ctor) {
    console.warn(`[Outbound] 不支持的协议类型: ${json.type}`);
    return undefined;
  }

  // 仅此处做一次类型桥接，后续新增协议完全不用改这里
  return Ctor.fromJSON(json as any)
}

// 提取公共的 base64 解析逻辑
export function parseBase64(text: string) {
  const decoded = Buffer.from(text, "base64")
    .toString("utf8")
    .split("\n")
    .map((uri: string) => uri.trim())
    .filter((uri: string) => uri != null && uri.includes("://"))

  return (decoded as any[])
    .map(fromUri)
    .filter((o): o is IOutbound => o !== undefined);
}

// 提取公共的 json 解析逻辑
export function parseJson(raw: string | object) {
  const json = typeof raw === "string" ? JSON.parse(raw) : raw;
  if (!json?.outbounds || !Array.isArray(json.outbounds)) {
    return [];
  }

  return (json.outbounds as any[])
    .map(fromJSON)
    .filter((o): o is IOutbound => o !== undefined);
}

import { Shadowsocks, ShadowsocksConfig } from "./shadowsocks.ts"
import { Vmess, VmessConfig } from "./vmess.ts"
import { Vless, VlessConfig } from "./vless.ts"

export enum Protocol {
  Vmess = "vmess",
  Vless = "vless",
  Selector = "selector",
  URLTest = "urltest",
  Shadowsocks = "shadowsocks"
}

export enum URI {
  Vmess = "vmess",
  Vless = "vless",
  Shadowsocks = "ss"
}

export interface ProviderRes {
  outbounds: Array<VmessConfig | ShadowsocksConfig | VlessConfig>;
}

export type OutboundArray = Array<Vmess | Shadowsocks>;

export { Shadowsocks, Vmess, Vless }
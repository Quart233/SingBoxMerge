import { Vmess, VmessConfig } from './vmess.ts'
import { Shadowsocks, ShadowsocksConfig } from './shadowsocks.ts'

export type OutboundArray = Array<Vmess | Shadowsocks>;

export interface ProviderRes {
  outbounds: Array<VmessConfig | ShadowsocksConfig>;
}
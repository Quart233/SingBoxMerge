import { VmessConfig } from "../outbounds/vmess.ts"
import { ShadowsocksConfig } from "../outbounds/shadowsocks.ts"

export interface ProviderRes {
  outbounds: Array<VmessConfig | ShadowsocksConfig>;
}
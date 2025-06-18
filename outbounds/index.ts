import { Vmess } from './vmess.ts'
import { Shadowsocks } from './shadowsocks.ts'

export type OutboundArray = Array<Vmess | Shadowsocks>;

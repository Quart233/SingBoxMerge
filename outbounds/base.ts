import { Vmess, VmessConfig } from './vmess.ts'
import { Shadowsocks, ShadowsocksConfig } from './shadowsocks.ts'

export enum Protocol {
  Vmess = "vmess",
  Selector = "selector",
  Shadowsocks = "shadowsocks"
}

export interface BaseConfig {
  type: Protocol;
  tag: string;
}

export class Outbound {
  config: BaseConfig;
  outbounds: OutboundArray;

  constructor(config: BaseConfig) {
    this.config = config
    this.outbounds = []
    this.validate(config)
  }

  validate(config: BaseConfig) {
    if (!config.type || !config.tag) {
      throw new Error('Invalid outbound configuration: missing required fields');
    }
  }

  toConfig(): BaseConfig & { outbounds: string[] } | BaseConfig {
    if (this.outbounds.length) { 
      return {
        ...this.config,
        outbounds: this.outbounds.map(o => o.toConfig().tag) // it's group.
      }
    } else {
      return this.config // it's remote. (eg. vmess shadowsocks)
    }
  }
}

export type OutboundArray = Array<Vmess | Shadowsocks>;

export interface ProviderRes {
  outbounds: Array<VmessConfig | ShadowsocksConfig>;
}
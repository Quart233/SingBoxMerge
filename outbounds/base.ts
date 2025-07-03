import { Protocol, OutboundArray } from './index.ts'


export interface BaseConfig {
  type: Protocol;
  tag: string;
}

export class Outbound {
  config: BaseConfig;
  outbounds: OutboundArray;

  constructor(config: BaseConfig, outbounds?: OutboundArray) {
    this.config = config
    this.outbounds = outbounds || []
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


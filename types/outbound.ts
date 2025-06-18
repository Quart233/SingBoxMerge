import { OutboundArray } from '../outbounds/index.ts'
export enum Protocol {
	Vmess = "vmess",
	Selector = "selector",
	Shadowsocks = "shadowsocks"
}

export interface BaseConfig {
	type: Protocol;
	tag: string;
	outbounds: OutboundArray;
}

export class Base {
	config: BaseConfig;

	constructor(config: BaseConfig) {
		this.config = config
	}

	validate(config: BaseConfig) {
    if (!config.type || !config.tag) {
      throw new Error('Invalid outbound configuration: missing required fields');
    }
  }
}

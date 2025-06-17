export enum Protocol {
	Vmess = "vmess",
	Shadowsocks = "shadowsocks"
}

export interface BaseConfig {
	type: Protocol;
	tag: string;
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

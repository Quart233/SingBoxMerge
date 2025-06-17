import { Base, BaseConfig } from "../types/outbound.ts"

export interface ShadowsocksConfig extends BaseConfig {
	server: string;
}

export class Shadowsocks extends Base {
	constructor(config: ShadowsocksConfig) {
		super(config);
	}
}
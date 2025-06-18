import { Base, BaseConfig } from "./base.ts"

export interface ShadowsocksConfig extends BaseConfig {
	server: string;
	server_port: number;
}

export class Shadowsocks extends Base {
	constructor(config: ShadowsocksConfig) {
		super(config);
	}
}
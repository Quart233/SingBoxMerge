import { Outbound, BaseConfig } from "./base.ts"

export interface ShadowsocksConfig extends BaseConfig {
	server: string;
	server_port: number;
}

export class Shadowsocks extends Outbound {
	constructor(config: ShadowsocksConfig) {
		super(config);
	}
}
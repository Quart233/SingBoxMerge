import { Outbound, BaseConfig } from "./base.ts"

export interface VlessConfig extends BaseConfig {
	server: string;
	server_port: number;
}

export class Vless extends Outbound {
	constructor(config: VlessConfig) {
		super(config);
	}
}
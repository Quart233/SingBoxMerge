import { Outbound, BaseConfig } from "./base.ts"

export interface Config extends BaseConfig {
	server: string;
	server_port: number;
}

export class Vless extends Outbound {
	constructor(config: Config) {
		super(config);
	}
}
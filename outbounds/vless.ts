import { Base, BaseConfig } from "./base.ts"

export interface Config extends BaseConfig {
	server: string;
	server_port: number;
}

export class Vless extends Base {
	constructor(config: Config) {
		super(config);
	}
}
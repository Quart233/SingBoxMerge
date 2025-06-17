import { Base, BaseConfig } from "../types/outbound.ts"

export interface VmessConfig extends BaseConfig {
	server: string;
	transport?: object;
}

export class Vmess extends Base {
	constructor(config: VmessConfig) {
		config.transport = {}
		super(config);
	}
}
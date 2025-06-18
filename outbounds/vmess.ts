import { Outbound, BaseConfig } from "./base.ts"

export interface VmessConfig extends BaseConfig {
	server: string;
	server_port: number;
	transport?: object;
}

export class Vmess extends Outbound {
	constructor(config: VmessConfig) {
		config.transport = {}
		super(config);
		this.validate(config)
	}

	override validate(config: VmessConfig) {
    if (!config.server || !config.server_port) {
      throw new Error('Invalid vmess configuration: missing required fields');
    }
  }

}
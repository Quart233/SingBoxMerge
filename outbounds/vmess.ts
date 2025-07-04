import { Buffer } from 'node:buffer';
import { Protocol } from "./index.ts"
import { Outbound, BaseConfig } from "./base.ts"

export interface Config extends BaseConfig {
	tag: string;
	uuid: string;
	server: string;
	server_port: number;
	security: string;
	alter_id: number;
	transport?: object;
}

export interface VmessConfig {
	add: string;
	ps: string;
	id: string;
	scy: string;
	aid: number;
	port: number;
}

export class Vmess extends Outbound {
	constructor(config: Config) {
		config.transport = {}
		super(config);
		this.validate(config)
	}

	static decode(uri: string) {
		// Todo: vmess outbound uri decode.
		const base64 = uri.substring(8);
	  const decoded = Buffer.from(base64, "base64").toString("utf8");
	  const config: VmessConfig = JSON.parse(decoded);

		const instance = new Vmess({
			tag: config.ps,
			type: Protocol.Vmess,
			security: config.scy,
			uuid: config.id,
			server: config.add,
			alter_id: Number(config.aid),
			server_port: Number(config.port)
		})
		return instance;
	}

	override validate(config: Config) {
    if (!config.server || !config.server_port) {
      throw new Error('Invalid vmess configuration: missing required fields');
    }
  }
}
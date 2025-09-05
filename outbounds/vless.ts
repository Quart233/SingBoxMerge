import { Base, BaseConfig } from "./base.ts"
import { Protocol } from "./index.ts";

interface VlessExtraConfig {
	type: string;
	encryption: string;
	host: string;
	path: string;
	headerType: string;
	quicSecurity: string;
	serviceName: string;
	security: string;
	flow: string;
	fp: string;
	sni: string;
	pbk: string;
	sid: string;
}

interface Reality {
	short_id: string;
	public_key: string;
}

interface SingBoxTLS {
	reality: Reality;
}

export interface Config extends BaseConfig {
	server: string;
	server_port: number;
	uuid: string;
	flow?: string;
	tls?: SingBoxTLS;
}

export class Vless extends Base {
	constructor(config: Config) {
		super(config);
	}

	static decode(uri: string) {
		const url = new URL(uri)

	    const params: Partial<VlessExtraConfig> = url.search.slice(1).split("&").reduce((hashMap: { [key: string]: string }, str) => {
		    const kv = str.split('=')
		    const k = kv[0]
		    const v = kv[1]

		    hashMap[k] = v;

		    return hashMap;
	    }, {})

	    console.log(params)

		const instance = new Vless({
			type: Protocol.Vless,
			tag: decodeURIComponent(url.hash.slice(1)),
			server: url.hostname,
			server_port: Number(url.port),
			uuid: url.username,
			flow: params.flow,
			tls: {
				enabled: true,
				server_name: params.sni,
				utls: {
					enabled: true,
					fingerprint: params.fp
				},
				reality: {
					enabled: true,
					short_id: params.sid,
					public_key: params.pbk
				}
			}
		})

		return instance;
	}
}
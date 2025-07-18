import { Protocol, TLSConfig } from "./index.ts"
import { Outbound, BaseConfig } from "./base.ts"
import { log } from "node:console";

export interface TrojanTLS {
  allowInsecure: boolean;
  udp: boolean;
  peer: string;
  sni: string; 
}

export interface Config extends BaseConfig {
	server: string;
	server_port: number;
	password: string;
  network: string;
  tls: Partial<TLSConfig>
}

export class Trojan extends Outbound {
	constructor(config: Config) {
		super(config);
	}

	static decode(uri: string) {
    const url = new URL(uri);


    const params = url.search.slice(1).split("&").reduce((hashMap: Partial<TrojanTLS>, str) => {
      const kv = str.split('=')
      const k = kv[0]
      const v = kv[1]

      const transform = {
        udp: (v: string) => v === "1",
        allowInsecure: (v: string) => v === "1",
        peer: (v: string) => v,
        sni: (v: string) => v
      }

      return Object.assign(hashMap, { [k]: transform[k](v) })
    }, {})

    log(params)

		const instance = new Trojan({
			type: Protocol.Trojan,
			tag: decodeURIComponent(url.hash.slice(1)),
			password: url.username,
			server: url.hostname,
			server_port: Number(url.port),
      network: "tcp",
      tls: {
        enabled: true,
        insecure: true,
        server_name: params.sni
      }
		})
		return instance;
	}
}
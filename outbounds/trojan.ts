import { Protocol, TLSConfig } from "./index.ts"
import { Outbound, BaseConfig } from "./base.ts"
import { log } from "node:console";

export interface TrojanTLS {
  allowInsecure: string;
  udp: string;
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

    const params: Partial<TrojanTLS> = url.search.slice(1).split("&").reduce((hashMap: { [key: string]: string }, str) => {
      const kv = str.split('=')
      const k = kv[0]
      const v = kv[1]

      hashMap[k] = v;

      return hashMap;
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
        insecure: params.allowInsecure === "1",
        server_name: params.sni
      }
		})
		return instance;
	}
}
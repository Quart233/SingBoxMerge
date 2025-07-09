import { Provider, Fields } from "./base.ts"
import {
		URI,
		ProviderRes,
		Shadowsocks,
		Vmess,
		Vless
} from "../outbounds"

export class SingBox extends Provider {
	static async create(f: Fields) {
	  const instance = new SingBox(f.name, f.url);
	  const res = await fetch(f.url);
	  const json: ProviderRes = await res.json();

	  instance.outbounds = json.outbounds.map(o => {
	    switch (o.type) {
	      case URI.Shadowsocks:
	        return new Shadowsocks(o);
	      case URI.Vmess:
	        return new Vmess(o);
	      case URI.Vless:
	        return new Vless(o);
	    }
	  }).filter(o => o != undefined)

	  return instance;
	}
}

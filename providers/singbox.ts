import { Base, Fields } from "./base.ts"
import { Protocol, Outbounds, ProviderRes } from "../outbounds"

export class SingBox extends Base {
	static async create(f: Fields) {
	  const instance = new SingBox(f.name, f.url);
	  const res = await fetch(f.url);
	  const json: ProviderRes = await res.json();

	  instance.outbounds = json.outbounds.map(o => {
	    switch (o.type) {
	      case Protocol.Shadowsocks:
	        return new Outbounds.Shadowsocks(o);
	      case Protocol.Vmess:
	        return new Outbounds.Vmess(o);
	      case Protocol.Vless:
	        return new Outbounds.Vless(o);
	    }
	  }).filter(o => o != undefined)

	  return instance;
	}
}

import { Buffer } from 'node:buffer';
import { Provider, Fields } from "./base.ts"
import { URI, Protocol, Shadowsocks, Vmess } from "../outbounds"
import { Outbound } from "../outbounds/base.ts";

export class Base64 extends Provider {
	static async create(f: Fields) {
	  const instance = new Base64(f.name, f.url);
	  const res = await fetch(f.url);
	  const text = await res.text();
	  const decoded = Buffer.from(text, "base64").toString("utf8");
	  const list = decoded.split('\n').filter(uri => uri).map(uri => uri.trim())

	  console.log(list)

	  instance.outbounds = list.map(uri => {
	  	const protocol = uri.split("://")[0]

	  	switch(protocol) {
		  	case URI.Vmess:
		  		return Vmess.decode(uri)
		  	case URI.Shadowsocks:
		  		return Shadowsocks.decode(uri)
		  	default:
		  		return new Outbound({ tag: "Empty", type: Protocol.Selector })
	  	}
	  })

	  return instance;
	}
}

import { Buffer } from 'node:buffer';
import { Provider, Fields } from "./base.ts"
import { Vmess } from "../outbounds"

export class V2 extends Provider {
	static async create(f: Fields) {
	  const instance = new V2(f.name, f.url);
	  const res = await fetch(f.url);
	  const text = await res.text();
	  const decoded = Buffer.from(text, "base64").toString("utf8");
	  const list = decoded.split('\n').filter(uri => uri).map(uri => uri.trim())

	  console.log(list)

	  instance.outbounds = list.map(uri => Vmess.decode(uri))

	  return instance;
	}
}

import { ProviderRes } from "./base.ts"
import { Protocol } from "./outbound.ts"
import { Vmess } from "../outbounds/vmess.ts"
import { Shadowsocks } from "../outbounds/shadowsocks.ts"

export class Provider implements Provider {
  name: string;
  url: string;
  outbounds: Array<Vmess | Shadowsocks>;

  constructor(name: string, url: string) {
    this.name = name;
    this.url = url;
    this.outbounds = [];
  }

  byFlags() {
    return this.outbounds.reduce((hashMap: { [key: string]: string[] }, o) => {

      const match = o.config.tag.match(/[\u{1F1E6}-\u{1F1FF}]{2}/u); // Match country flags.
      const flag = match ? match.toString() : "misc";
      const key = `${this.name} ${flag}`

      hashMap[key] = hashMap[key] || []; // Reference or initialize.
      hashMap[key].push(o.config.tag);

      return hashMap;
    }, {})
  }
}

export class ProviderFactory {
  static async create(name: string, url: string) {
    const instance = new Provider(name, url);
    const res = await fetch(url);
    const json: ProviderRes = await res.json();

    instance.outbounds = json.outbounds.map(o => {
      switch (o.type) {
        case Protocol.Shadowsocks:
          return new Shadowsocks(o);
        case Protocol.Vmess:
          return new Vmess(o);
      }
    }).filter(o => o != undefined)

    return instance;
  }
}

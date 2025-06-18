import { Protocol, Base } from './outbound.ts'
import { Vmess } from "../outbounds/vmess.ts"
import { Shadowsocks } from "../outbounds/shadowsocks.ts"
import { OutboundArray, ProviderRes } from "../outbounds/base.ts"

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
      const countries = this.outbounds.reduce((hashMap: { [key: string]:OutboundArray }, outbound) => {

      const match = outbound.config.tag.match(/[\u{1F1E6}-\u{1F1FF}]{2}/u); // Match country flags.
      const flag = match ? match.toString() : "misc";
      const key = `${this.name} ${flag}`

      hashMap[key] = hashMap[key] || []; // Reference or initialize.
      hashMap[key].push(outbound);

      return hashMap;
    }, {})
    return Object.keys(countries).map(flag => new Base({ tag: flag, type: Protocol.Selector, outbounds: countries[flag] }))
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

import { Buffer } from 'node:buffer';

import { URI, Protocol, Shadowsocks, Vmess, Trojan, ProviderRes } from "../outbounds"
import { BaseConfig, IOutbound, Base } from "../outbounds/base.ts"
import { Fields } from './index.ts'

export interface IProvider extends Fields {
  toConfig: () => BaseConfig[];
  groups: () => IOutbound[];
  prefix: (t: string) => string
}

export class Provider implements IProvider {
  name: string;
  url: string;
  outbounds: IOutbound[];

  prefix(t: string) {
    const match = t.match(/[\u{1F1E6}-\u{1F1FF}]{2}/u)
    return match? match.toString(): 'misc';
  };

  constructor(name: string, url: string) {
    this.name = name;
    this.url = url;
    this.outbounds = [];
  }

  groups() {
    const countries = this.outbounds.reduce((hashMap: { [key: string]:IOutbound[] }, outbound) => {

      const flag = this.prefix(outbound.config.tag) // Match prefix.

      hashMap[flag] = hashMap[flag] || []; // Reference or initialize.
      hashMap[flag].push(outbound);

      return hashMap;
    }, {})

    return Object.keys(countries).map(flag => {
      const o = new Base({ tag: `${this.name} ${flag}`, type: Protocol.Selector })
      o.outbounds = countries[flag];
      return o;
    })
  }

  toConfig() {
    return this.outbounds.map(o => o.toConfig())
  }

  static async base64(f: Fields) {
    const instance = new Provider(f.name, f.url);
    const res = await fetch(f.url);
    const text = await res.text();
    const decoded = Buffer.from(text, "base64").toString("utf8");
    const list = decoded.split('\n').filter(uri => uri).map(uri => uri.trim())

    instance.outbounds = list.map(uri => {
      const protocol = uri.split("://")[0]

      switch(protocol) {
        case URI.Trojan:
          return Trojan.decode(uri)
        case URI.Vmess:
          return Vmess.decode(uri)
        case URI.Shadowsocks:
          return Shadowsocks.decode(uri)
        default:
          return new Base({ tag: "Empty", type: Protocol.Selector })
      }
    })

    return instance;
  }

  static async json(f: Fields) {
    const instance = new Provider(f.name, f.url);
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

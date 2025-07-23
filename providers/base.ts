import { Protocol } from "../outbounds"
import { BaseConfig, IOutbound, Outbound } from "../outbounds/base.ts"

export interface Fields {
  name: string;
  url: string;
  prefix: (t: string) => string
}

export interface IProvider extends Fields {
  toConfig: () => BaseConfig[];
  groups: () => IOutbound[];
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
      const o = new Outbound({ tag: `${this.name} ${flag}`, type: Protocol.Selector })
      o.outbounds = countries[flag];
      return o;
    })
  }

  toConfig() {
    return this.outbounds.map(o => o.toConfig())
  }
}

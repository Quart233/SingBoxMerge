import { OutboundArray, Protocol } from "../outbounds"
import { Outbound } from "../outbounds/base.ts"

export interface Fields {
  name: string;
  url: string;
  template: string;
}

export class Base implements Fields {
  name: string;
  url: string;
  outbounds: OutboundArray;

  constructor(name: string, url: string) {
    this.name = name;
    this.url = url;
    this.outbounds = [];
  }

  byFlags() {
    const countries = this.outbounds.reduce((hashMap: { [key: string]:OutboundArray }, outbound) => {

      const match = outbound.config.tag.match(/[\u{1F1E6}-\u{1F1FF}]{2}/u); // Match country flags.
      const flag = match ? match.toString() : "misc";

      hashMap[flag] = hashMap[flag] || []; // Reference or initialize.
      hashMap[flag].push(outbound);

      return hashMap;
    }, {})

    const instance = new Base(this.name, this.url)
    instance.outbounds = Object.keys(countries).map(flag => {
      const o = new Outbound({ tag: `${this.name} ${flag}`, type: Protocol.Selector })
      o.outbounds = countries[flag];
      return o;
    })

    return instance;
  }

  toConfig() {
    return this.outbounds.map(o => o.toConfig())
  }
}

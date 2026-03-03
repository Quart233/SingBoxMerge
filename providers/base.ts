import { IOutbound, Base } from "../outbounds/base.ts";
import { Protocol } from "../outbounds/mod.ts";

export abstract class Provider {
  name: string;
  outbounds: IOutbound[];

  constructor(name: string) {
    this.name = name;
    this.outbounds = [];
  }

  protected abstract prefix(tag: string): string;

  groups() {
    const countries = this.outbounds.reduce(
      (hashMap: { [key: string]: IOutbound[] }, outbound) => {
        const flag = this.prefix(outbound.config.tag); // Match prefix.

        hashMap[flag] = hashMap[flag] || []; // Reference or initialize.
        hashMap[flag].push(outbound);

        return hashMap;
      },
      {},
    );

    return Object.keys(countries).map((flag) => {
      const o = new Base({
        tag: `${this.name} ${flag}`,
        type: Protocol.Selector,
      });
      o.outbounds = countries[flag];
      return o;
    });
  }

  toConfig() {
    return this.outbounds.map((o) => o.toConfig());
  }
}

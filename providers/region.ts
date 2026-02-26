import { getNames } from "npm:country-list@2.3.0";
import { Provider } from "./base.ts";
import { Buffer } from "node:buffer";
import { Fields } from "./index.ts";
import * as Utils from "../utils";
import {
  URI,
  Protocol,
  Shadowsocks,
  Vmess,
  Trojan,
  Vless,
  ProviderRes,
} from "../outbounds/index.ts";
import { Base } from "../outbounds/base.ts";

export class Region extends Provider {
  override prefix(t: string) {
    const keyword = t.split("|")[0].trim();
    const match = getNames().includes(keyword); // Keywords
    return match ? keyword : "misc";
  }

  static async base64(f: Fields) {
    const instance = new Region(f.name, f.url);
    const text = await Utils.loadData(f.url);

    const decoded = Buffer.from(text, "base64").toString("utf8");
    const list = decoded
      .split("\n")
      .filter((uri) => uri)
      .map((uri) => uri.trim());

    instance.outbounds = list.map((uri) => {
      const protocol = uri.split("://")[0];

      switch (protocol) {
        case URI.Trojan:
          return Trojan.decode(uri);
        case URI.Vmess:
          return Vmess.decode(uri);
        case URI.Shadowsocks:
          return Shadowsocks.decode(uri);
        case URI.Vless:
          return Vless.decode(uri);
        default:
          return new Base({ tag: "Empty", type: Protocol.Selector });
      }
    });

    return instance;
  }

  static async json(f: Fields) {
    const instance = new Region(f.name, f.url);

    const fileContent = await Utils.loadData(f.url);
    const json = JSON.parse(fileContent) as ProviderRes;

    instance.outbounds = json.outbounds
      .map((o) => {
        switch (o.type) {
          case Protocol.Shadowsocks:
            return new Shadowsocks(o);
          case Protocol.Vmess:
            return new Vmess(o);
          case Protocol.Vless:
            return new Vless(o);
        }
      })
      .filter((o) => o != undefined);

    return instance;
  }
}

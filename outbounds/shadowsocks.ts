import { Buffer } from 'node:buffer'
import { Protocol } from "./index.ts"
import { Base, BaseConfig } from "./base.ts"

export interface Config extends BaseConfig {
  server: string;
  server_port: number;
  method: string;
  password: string;
}

export class Shadowsocks extends Base {
  constructor(config: Config) {
    super(config);
  }

  static fromURI(uri: string): Shadowsocks {
    const url = new URL(uri);
    const encrytption = Buffer.from(url.username, "base64").toString("utf8").split(":");

    const instance = new Shadowsocks({
      type: Protocol.Shadowsocks,
      tag: decodeURIComponent(url.hash.slice(1)),
      method: encrytption[0],
      password: encrytption[1],
      server: url.hostname,
      server_port: Number(url.port)
    })
    return instance;
  }

  static fromJSON(json: Config): Shadowsocks {
    return new Shadowsocks(json);
  }
}

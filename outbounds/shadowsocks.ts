import { Buffer } from 'node:buffer';
import { Protocol } from "./index.ts"
import { Outbound, BaseConfig } from "./base.ts"

export interface ShadowsocksConfig extends BaseConfig {}

export interface Config extends BaseConfig {
  server: string;
  server_port: number;
  method: string;
  password: string;
}

export class Shadowsocks extends Outbound {
  constructor(config: Config) {
    super(config);
  }

  static decode(uri: string) {
    const url = uri.substring(5);
    const userinfo = url.split("@");
    const base64 = userinfo[0];

    const encrytption = Buffer.from(base64, "base64").toString("utf8").split(":");

    console.log(encrytption)

    const endpoint = userinfo[1].split("#");
    const server = endpoint[0].split(":");

    const instance = new Shadowsocks({
      type: Protocol.Shadowsocks,
      tag: decodeURIComponent(endpoint[1]),
      method: encrytption[0],
      password: encrytption[1],
      server: server[0],
      server_port: Number(server[1])
    })
    return instance;
  }
}
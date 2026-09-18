import { Base, BaseConfig, Protocol } from "../outbounds/mod.ts";

interface VlessExtraConfig {
  type: string;
  encryption: string;
  host: string;
  path: string;
  headerType: string;
  quicSecurity: string;
  serviceName: string;
  security: string;
  flow: string;
  fp: string;
  sni: string;
  pbk: string;
  sid: string;
}

interface Reality {
  enabled: boolean;
  short_id: string;
  public_key: string;
}

interface SingBoxUTLS {
  enabled: boolean;
  fingerprint: string;
}

interface SingBoxTLS {
  enabled: boolean;
  reality: Reality;
  server_name: string;
  utls: SingBoxUTLS;
}

export interface Config extends BaseConfig {
  server: string;
  server_port: number;
  uuid: string;
  flow?: string;
  tls?: SingBoxTLS;
}

export class Vless extends Base {
  constructor(config: Config) {
    super(config);
  }

  static fromJSON(json: Config) {
    return new Vless(json);
  }

  static fromURI(uri: string) {
    const url = new URL(uri);

    const params: Partial<VlessExtraConfig> = url.search
      .slice(1)
      .split("&")
      .reduce((hashMap: { [key: string]: string }, str) => {
        const kv = str.split("=");
        const k = kv[0];
        const v = kv[1];

        hashMap[k] = v;

        return hashMap;
      }, {});

    const instance = new Vless({
      type: Protocol.Vless,
      tag: decodeURIComponent(url.hash.slice(1)),
      server: url.hostname,
      server_port: Number(url.port),
      uuid: url.username,
      flow: params.flow,
      tls: {
        enabled: true,
        server_name: params.sni as string,
        utls: {
          enabled: true,
          fingerprint: params.fp as string,
        },
        reality: {
          enabled: true,
          short_id: params.sid as string,
          public_key: params.pbk as string,
        },
      },
    });

    return instance;
  }
}

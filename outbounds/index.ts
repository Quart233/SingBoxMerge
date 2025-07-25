import * as Shadowsocks from "./shadowsocks.ts"
import * as Vmess from "./vmess.ts"
import * as Vless from "./vless.ts"
import * as Trojan from "./trojan.ts"

export enum Protocol {
  Vmess = "vmess",
  Vless = "vless",
  Trojan = "trojan",
  Selector = "selector",
  URLTest = "urltest",
  Shadowsocks = "shadowsocks"
}

export enum URI {
  Vmess = "vmess",
  Vless = "vless",
  Trojan = "trojan",
  Shadowsocks = "ss"
}

export interface TLSConfig {
  enabled: boolean;
  disable_sni: boolean;
  server_name: string;
  insecure: boolean;
  alpn: string[];
  min_version: string;
  max_version: string;
  cipher_suites: string[];
  certificate: string[];
  certificate_path: string;
  fragment: boolean;
  fragment_fallback_delay: string;
  record_fragment: boolean;
  ech: {
    enabled: boolean;
    pq_signature_schemes_enabled: boolean;
    dynamic_record_sizing_disabled: boolean;
    config: string[];
    config_path: string;
  };
  utls: {
    enabled: boolean;
    fingerprint: string;
  };
  reality: {
    enabled: boolean;
    public_key: string;
    short_id: string;
  };
}

export interface ProviderRes {
  outbounds: Array<Vmess.Config | Shadowsocks.Config | Vless.Config | Trojan.Config>;
}

export { Shadowsocks, Vmess, Vless, Trojan }
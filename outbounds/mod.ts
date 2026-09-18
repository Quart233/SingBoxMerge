export {
  Base,
  Protocol,
  type BaseConfig,
  type IOutbound,
} from "./base.ts";

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

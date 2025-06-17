import { Vmess, VmessConfig } from "../outbounds/vmess.ts"
import { Shadowsocks, ShadowsocksConfig } from "../outbounds/shadowsocks.ts"

export interface SingBoxConfig {
  log?: {
    disabled?: boolean;
    level?: 'debug' | 'info' | 'warn' | 'error';
    timestamp?: boolean;
  };
  experimental?: {
    clash_api?: {
      external_controller?: string;
      external_ui?: string;
      secret?: string;
      external_ui_download_url?: string;
      external_ui_download_detour?: string;
      access_control_allow_origin?: string[];
      default_mode?: 'rule' | 'global' | 'direct';
    };
    cache_file?: {
      enabled?: boolean;
      store_fakeip?: boolean;
      store_rdrc?: boolean;
    };
  };
  dns?: {
    servers?: Array<{
      tag?: string;
      address?: string;
      detour?: string;
    }>;
    rules?: Array<{
      outbound?: string;
      server?: string;
      clash_mode?: 'direct' | 'global' | 'rule';
    }>;
    strategy?: 'ipv4_only' | 'ipv6_only' | 'prefer_ipv4' | 'prefer_ipv6';
  };
  ntp?: {
    enabled?: boolean;
    server?: string;
    server_port?: number;
    interval?: string;
  };
  inbounds?: Array<{
    tag?: string;
    type?: 'mixed' | 'tun';
    listen?: string;
    listen_port?: number;
    set_system_proxy?: boolean;
    address?: string[];
    mtu?: number;
    auto_route?: boolean;
    strict_route?: boolean;
    stack?: 'system';
    platform?: {
      http_proxy?: {
        enabled?: boolean;
        server?: string;
        server_port?: number;
      };
    };
  }>;
  outbounds?: Array<Vmess | Shadowsocks>;
  route?: {
    auto_detect_interface?: boolean;
    final?: string;
    rules?: Array<{
      inbound?: string[];
      action?: 'sniff' | 'hijack-dns' | 'reject';
      type?: 'logical';
      mode?: 'or';
      rules?: Array<{
        port?: number;
        protocol?: string;
      }>;
      rule_set?: string | string[];
      clash_mode?: 'rule' | 'global' | 'direct';
      outbound?: string;
      domain?: string[];
      domain_suffix?: string[];
    }>;
    rule_set?: Array<{
      tag?: string;
      type?: 'remote';
      format?: 'binary';
      url?: string;
      download_detour?: string;
    }>;
  };
}

export interface ProviderRes {
  outbounds: Array<VmessConfig | ShadowsocksConfig>;
}
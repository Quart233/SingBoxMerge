import { pathToFileURL } from "node:url";

import { Base, Protocol, type IOutbound } from "../outbounds/mod.ts";
import { Provider } from "../providers/mod.ts";

export const internalOutbounds = [
  { type: "direct", tag: "DoH", domain_resolver: "DNSPod" },
  { type: "direct", tag: "direct" },
  { type: "block", tag: "block" },
];

export function leaf(tag: string, type = Protocol.Vless): IOutbound {
  return new Base({ tag, type });
}

export class StubProvider extends Provider {
  constructor(name: string, outbounds: IOutbound[]) {
    super(name);
    this.outbounds = outbounds;
  }

  prefix(tag: string) {
    if (tag.includes("JP") || tag.startsWith("Japan")) return "Japan";
    return "misc";
  }
}

export function sampleNodes() {
  return {
    outbounds: [
      {
        type: "vless",
        tag: "Japan | tokyo",
        server: "1.1.1.1",
        server_port: 443,
        uuid: "00000000-0000-0000-0000-000000000001",
      },
      {
        type: "shadowsocks",
        tag: "misc-node",
        server: "2.2.2.2",
        server_port: 8388,
        method: "aes-256-gcm",
        password: "pwd",
      },
    ],
  };
}

export function sampleTemplate() {
  return {
    log: { level: "info" },
    dns: { servers: [{ tag: "localDns" }] },
    inbounds: [{ tag: "mixed-in", type: "mixed" }],
    outbounds: [],
    route: {
      final: "proxy",
      rules: [
        { ip_cidr: ["127.0.0.1"], outbound: "direct" },
        { domain_suffix: ["youtube.com"], outbound: "Youtube" },
        { action: "sniff" },
      ],
    },
  };
}

export async function writeJsonFixture(dir: string, name: string, data: unknown) {
  const path = `${dir}/${name}`;
  await Deno.writeTextFile(path, JSON.stringify(data));
  return pathToFileURL(path).href;
}

export async function withWarnCapture<T>(fn: () => T | Promise<T>) {
  const warnings: string[] = [];
  const original = console.warn;
  console.warn = (...args: unknown[]) => {
    warnings.push(args.map(String).join(" "));
  };
  try {
    return { value: await fn(), warnings };
  } finally {
    console.warn = original;
  }
}

import { Outbound } from "../outbounds/base.ts";
import { Protocol } from "../outbounds";
import { OutboundArray } from "../providers";
import { V2, SingBox } from "../providers";

interface Rule {
  outbound: string;
  [key: string]: any;
}

interface ProfileConfig {
  rules: Rule[];
  internalOutbounds: { type: string; tag: string }[];
  profiles: Array<V2 | SingBox>;
}

interface OutboundConfig {
  type: string;
  tag: string;
  outbounds?: string[];
}

class Profile {
  private rules: Rule[];
  private internalOutbounds: ProfileConfig["internalOutbounds"]
  private profiles: Array<V2 | SingBox>;
  private cachedOutbounds: OutboundConfig[] | null = null;

  constructor(config: ProfileConfig) {
    this.rules = config.rules;
    this.internalOutbounds = config.internalOutbounds
    this.profiles = config.profiles;
    this.validateRules();
  }

  // 验证规则有效性
  private validateRules(): void {
    this.rules.forEach((rule, index) => {
      if (!rule.outbound) {
        console.warn(`Invalid rule at index ${index}: missing outbound`);
      }
    });
  }

  // 生成规则对应的 Outbound 对象
  public generateRuleOutbounds(countries: OutboundArray): Outbound[] {
    return this.rules.map(rule => new Outbound({ tag: rule.outbound, type: Protocol.Selector }, countries));
  }

  // 生成代理选择器 Outbound 对象
  public generateProxyOutbound(countries: OutboundArray): Outbound {
    return new Outbound({ tag: "proxy", type: Protocol.Selector }, countries);
  }

  // 生成延迟测试 Outbound 对象
  public generateUrlTestOutbounds(): Outbound[] {
    return this.profiles.map(profile => 
      new Outbound({ tag: profile.name, type: Protocol.URLTest }, profile.outbounds)
    );
  }

  // 生成节点端点配置
  public generateEndpoints(): OutboundConfig[] {
    return this.profiles.map(p => p.toConfig()).flat();
  }

  // 生成所有出站配置
  public generateOutbounds(countries: OutboundArray): OutboundConfig[] {
    if (this.cachedOutbounds) {
      return this.cachedOutbounds;
    }

    const rules = this.generateRuleOutbounds(countries);
    const proxy = this.generateProxyOutbound(countries);
    const urltest = this.generateUrlTestOutbounds();
    const endpoints = this.generateEndpoints();

    this.cachedOutbounds = [
      ...this.internalOutbounds.map(o => ({ type: o.type, tag: o.tag })),
      proxy.toConfig(),
      ...rules.map(o => o.toConfig()),
      ...countries.map(p => p.toConfig()).flat(),
      ...urltest.map(p => p.toConfig()).flat(),
      ...endpoints
    ];

    return this.cachedOutbounds;
  }

  // 重置缓存
  public resetCache(): void {
    this.cachedOutbounds = null;
  }
}

export { Profile, ProfileConfig };
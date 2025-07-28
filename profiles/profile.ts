import { Base, IOutbound } from "../outbounds/base.ts";
import { Protocol } from "../outbounds";
import { IProvider } from "../providers/base.ts";
import * as Utils from '../utils'

interface Rule {
  outbound: string;
  [key: string]: any;
}

interface ProfileConfig {
  template: string;
  internalOutbounds: { type: string; tag: string }[];
  providers: Promise<IProvider>[];
}

interface OutboundConfig {
  type: string;
  tag: string;
  outbounds?: string[];
}

class Profile {
  private template;
  private rules: Rule[];
  private internalOutbounds: ProfileConfig["internalOutbounds"]
  private providers: IProvider[];
  private cachedOutbounds: OutboundConfig[] | null = null;

  constructor(config: ProfileConfig) {
    this.rules = [];
    this.providers = [];
    this.internalOutbounds = config.internalOutbounds
    this.validateRules();
  }

  static async create(config: ProfileConfig) {
    const fileContent = await Utils.loadData(config.template);
    const template = JSON.parse(fileContent)
    const instance = new Profile(config)

    instance.providers = await Promise.all(config.providers);
    instance.rules = template.route.rules;
    instance.template = template;

    return instance;
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
  public generateRuleOutbounds(countries: IOutbound[]): Base[] {
    return this.rules
               .filter(r => r.outbound)
               .filter(r => !this.internalOutbounds.map(o => o.tag).includes(r.outbound))
               .map(rule => new Base({ tag: rule.outbound, type: Protocol.Selector }, countries));
  }

  // 生成代理选择器 Outbound 对象
  public generateProxyOutbound(countries: IOutbound[]): Base {
    return new Base({ tag: "proxy", type: Protocol.Selector }, countries);
  }

  // 生成延迟测试 Outbound 对象
  public generateUrlTestOutbounds(): Base[] {
    return this.providers.map(profile =>
      new Base({ tag: profile.name, type: Protocol.URLTest }, profile.outbounds)
    );
  }

  // 生成节点端点配置
  public generateEndpoints(): OutboundConfig[] {
    return this.providers.map(p => p.toConfig()).flat();
  }

  // 生成所有出站配置
  public generateOutbounds(countries: IOutbound[]): OutboundConfig[] {
    if (this.cachedOutbounds) {
      return this.cachedOutbounds;
    }

    const rules = this.generateRuleOutbounds(countries);
    const proxy = this.generateProxyOutbound(countries);
    const urltest = this.generateUrlTestOutbounds();
    const endpoints = this.generateEndpoints();

    this.cachedOutbounds = [
      ...this.internalOutbounds,
      proxy.toConfig(),
      ...rules.map(o => o.toConfig()),
      ...countries.map(p => p.toConfig()).flat(),
      ...urltest.map(p => p.toConfig()).flat(),
      ...endpoints
    ];

    return this.cachedOutbounds;
  }

  // 生成配置文件
  generateConfig() {
    const countries = this.providers.map(p => p.groups()).flat()
    const outbounds = this.generateOutbounds(countries);
    return Object.assign(this.template, { outbounds });
  }

  // 重置缓存
  public resetCache(): void {
    this.cachedOutbounds = null;
  }
}

export { Profile, ProfileConfig };
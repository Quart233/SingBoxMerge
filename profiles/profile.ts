import { Base, IOutbound } from "../outbounds/base.ts";
import { Protocol } from "../outbounds/mod.ts";
import { Provider } from "../providers/mod.ts";
import { loadData } from "../utils/file.ts";

interface Rule {
  outbound?: string;
  [key: string]: any;
}

interface ProfileConfig {
  template: string;
  internalOutbounds: { type: string; tag: string }[];
  providers: Promise<Provider>[];
}

interface OutboundConfig {
  type: string;
  tag: string;
  outbounds?: string[];
}

interface Template {
  route: { rules: Rule[]; [key: string]: any };
  [key: string]: any;
}

export class Profile {
  private template: Template;
  private rules: Rule[];
  private internalOutbounds: ProfileConfig["internalOutbounds"];
  private providers: Provider[];
  private cachedOutbounds: OutboundConfig[] | null = null;

  private constructor(
    template: Template,
    internalOutbounds: ProfileConfig["internalOutbounds"],
    providers: Provider[],
  ) {
    this.template = template;
    this.internalOutbounds = internalOutbounds;
    this.providers = providers;
    this.rules = template.route.rules ?? [];
    this.validateRules();
  }

  static fromResolved(
    template: Template,
    internalOutbounds: ProfileConfig["internalOutbounds"],
    providers: Provider[],
  ) {
    if (!template?.route) {
      throw new Error("Invalid template: missing route");
    }

    return new Profile(template, internalOutbounds, providers);
  }

  static async create(config: ProfileConfig) {
    const fileContent = await loadData(config.template);
    const template = JSON.parse(fileContent) as Template;
    const providers = await Promise.all(config.providers);
    return Profile.fromResolved(
      template,
      config.internalOutbounds,
      providers,
    );
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
      .filter((r): r is Rule & { outbound: string } => Boolean(r.outbound))
      .filter(
        (r) => !this.internalOutbounds.map((o) => o.tag).includes(r.outbound),
      )
      .map(
        (rule) =>
          new Base({ tag: rule.outbound, type: Protocol.Selector }, countries),
      );
  }

  // 生成代理选择器 Outbound 对象
  public generateProxyOutbound(countries: IOutbound[]): Base {
    return new Base({ tag: "proxy", type: Protocol.Selector }, countries);
  }

  // 生成延迟测试 Outbound 对象
  public generateUrlTestOutbounds(): Base[] {
    return this.providers.map(
      (profile) =>
        new Base(
          { tag: profile.name, type: Protocol.URLTest },
          profile.outbounds,
        ),
    );
  }

  // 生成节点端点配置
  public generateEndpoints(): OutboundConfig[] {
    return this.providers.map((p) => p.toConfig()).flat();
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
      ...rules.map((o) => o.toConfig()),
      ...countries.map((p) => p.toConfig()).flat(),
      ...urltest.map((p) => p.toConfig()).flat(),
      ...endpoints,
    ];

    return this.cachedOutbounds;
  }

  // 生成配置文件
  generateConfig() {
    const countries = this.providers.map((p) => p.groups()).flat();
    const outbounds = this.generateOutbounds(countries);
    return Object.assign(this.template, { outbounds });
  }

  // 重置缓存
  public resetCache(): void {
    this.cachedOutbounds = null;
  }
}

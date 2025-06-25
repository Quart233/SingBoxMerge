import { createServer } from "node:http"
import { ProviderFactory, Provider }  from "./types/provider.ts"
import template from "./templates/mobile.json" with { type: "json" }
import { Protocol, Outbound } from "./outbounds/base.ts";

const queue: Promise<Provider>[] = [
  ProviderFactory.create("Provider Name", "Subscription URL")
]

const internal = [
  { "type": "direct", "tag": "direct" },
  { "type": "block", "tag": "block" }
]

const server = createServer(async (req, client) => {
  const providers = await Promise.all(queue);

  const country = providers.map(p => p.byFlags())
  const countries = country.map(p => p.outbounds).flat()
  const rules = template.route.rules
                     .filter(r => r.outbound)
                     .filter(r => !internal.map(o => o.tag).includes(r.outbound))
                     .map(r => new Outbound({ tag: r.outbound, type: Protocol.Selector }, countries))

  const endpoints = providers.map(p => p.toConfig()).flat()
  const proxy = new Outbound({ tag: "proxy", type: Protocol.Selector }, countries)
  const urltest = providers.map(p => new Outbound({ tag: p.name, type: Protocol.URLTest }, p.outbounds))
  const outbounds = [
    ...internal,
    proxy.toConfig(),
    ...rules.map(o => o.toConfig()),
    ...country.map(p => p.toConfig()).flat(),
    ...urltest.map(p => p.toConfig()).flat(),
    ...endpoints
  ]

  client.writeHead(200, { 'Content-Type': 'application/json' });
  client.end(JSON.stringify(Object.assign(template, { outbounds }), null, 2));
});

const PORT = 3000;
server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}/`);
});

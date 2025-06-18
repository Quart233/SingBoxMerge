import { createServer } from "node:http"
import { ProviderFactory, Provider }  from "./types/provider.ts"
import template from "./templates/template.json" with { type: "json" }
import { Protocol } from "./outbounds/base.ts";

const queue: Promise<Provider>[] = [
  ProviderFactory.create("Provider Name", "Subscription URL")
]

const internal = [
  { "type": "direct", "tag": "direct" },
  { "type": "block", "tag": "block" }
]

const server = createServer(async (req, client) => {
  const providers = await Promise.all(queue);

  const country = providers.map(p => p.byFlags()).map(p => p.toConfig())
  const rules = template.route.rules
                     .filter(r => !internal.map(o => o.tag).includes(r.outbound))
                     .map(r => ({ tag: r.outbound, type: Protocol.Selector, outbounds: country.flat().map(o => o.tag) }))

  const endpoints = providers.map(p => p.toConfig())
  const outbounds = [...internal, ...rules, ...country.flat(), ...endpoints.flat()]

  client.writeHead(200, { 'Content-Type': 'application/json' });
  client.end(JSON.stringify(Object.assign(template, { outbounds }), null, 2));
});

const PORT = 3000;
server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}/`);
});
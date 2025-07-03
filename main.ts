import { createServer } from "node:http"
import { SingBox } from "./providers"
import { Protocol } from "./outbounds";
import { Outbound } from "./outbounds/base.ts";

import template from "./templates/mobile.json" with { type: "json" }

const providers: Promise<SingBox>[] = [
  SingBox.create({
    name: "Provider Name"
    url: "Subscription URL"
  }),
]

const internal = [
  { "type": "direct", "tag": "direct" },
  { "type": "block", "tag": "block" }
]

const server = createServer(async (req, client) => {
  const profiles = await Promise.all(providers);

  const country = profiles.map(p => p.byFlags())
  const countries = country.map(p => p.outbounds).flat()
  const rules = template.route.rules
                     .filter(r => r.outbound)
                     .filter(r => !internal.map(o => o.tag).includes(r.outbound))
                     .map(r => new Outbound({ tag: r.outbound, type: Protocol.Selector }, countries))

  const endpoints = profiles.map(p => p.toConfig()).flat()
  const proxy = new Outbound({ tag: "proxy", type: Protocol.Selector }, countries)
  const urltest = profiles.map(p => new Outbound({ tag: p.name, type: Protocol.URLTest }, p.outbounds))
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

import { createServer } from "node:http"
import { Base64 } from "./providers"
import { Profile } from "./profiles/profile.ts"

import template from "./templates/socks5.json" with { type: "json" }

const providers: Promise<Base64>[] = [
  Base64.create({
    name: "Provider Name",
    url: "Subscription URL"
  }),
]

const internal = [
  { type: "direct", tag: "direct" },
  { type: "block", tag: "block" },
];

const server = createServer(async (req, client) => {

  const profiles = await Promise.all(providers);
  const countries = profiles.map(p => p.byFlags()).map(p => p.outbounds).flat();

  const profile = new Profile({
    rules: template.route.rules,
    internalOutbounds: internal,
    profiles,
  });

  const outbounds = profile.generateOutbounds(countries);

  client.writeHead(200, { "Content-Type": "application/json" });
  client.end(JSON.stringify(Object.assign(template, { outbounds }), null, 2));
});

const PORT = 3000;
server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}/`);
});

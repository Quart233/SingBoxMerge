import { createServer } from "node:http"
import { Base64, JSONProvider } from "./providers"
import { Profile } from "./profiles/profile.ts"

const providers: Promise<Base64 | JSONProvider>[] = [
  Base64.create({
    name: "Provider Name",
    url: "Subscription URL"
  })
]

const internal = [
  { type: "direct", tag: "direct" },
  { type: "block", tag: "block" },
];

const server = createServer(async (req, client) => {

  const profiles = await Promise.all(providers);

  const profile = await Profile.create({
    template: "Template URL",
    internalOutbounds: internal,
    profiles,
  });

  client.writeHead(200, { "Content-Type": "application/json" });
  client.end(JSON.stringify(profile.generateConfig(), null, 2));
});

const PORT = 3000;
server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}/`);
});

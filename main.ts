import { createServer } from "node:http"
import * as Provider from "./providers"
import { Profile } from "./profiles/profile.ts"
import { IProvider } from "./providers/base.ts";

const providers: Promise<IProvider>[] = [
  Provider.RegExp.base64({
    name: "Provider Name",
    url: "Subscription URL",
  }),
  Provider.Region.base64({
    name: "Provider Name",
    url: "Subscription URL",
  })
]

const internal = [
  { type: "direct", tag: "direct" },
  { type: "block", tag: "block" },
];

const server = createServer(async (req, client) => {

  const profile = await Profile.create({
    template: "Template URL",
    internalOutbounds: internal,
    providers
  });

  client.writeHead(200, { "Content-Type": "application/json" });
  client.end(JSON.stringify(profile.generateConfig(), null, 2));
});

const PORT = 3000;
server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}/`);
});

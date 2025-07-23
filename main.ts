import { createServer } from "node:http"
import { Base64, JSONProvider } from "./providers"
import { Profile } from "./profiles/profile.ts"

const providers: Promise<Base64>[] = [
  Base64.create({
    name: "Provider Name",
    url: "Subscription URL",
    prefix: (t: string) => {
      const match = t.match(/[\u{1F1E6}-\u{1F1FF}]{2}/u) // Emoji flags
      return match? match.toString(): 'misc'
    }
  }),
  Base64.create({
    name: "Provider Name",
    url: "Subscription URL",
    prefix: (t: string) => {
      const keyword = t.split('|')[0].trim();
      const match = ['Hong Kong'].includes(keyword) // Keywords
      return match? keyword: 'misc'
    }
  })
]

const internal = [
  { type: "direct", tag: "direct" },
  { type: "block", tag: "block" },
];

const server = createServer(async (req, client) => {

  const profile = await Profile.create({
    template: "Temlate URL",
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

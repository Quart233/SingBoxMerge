import { createServer } from "node:http"
import { ProviderFactory, Provider }  from "./types/provider.ts"

const queue: Promise<Provider>[] = [
  ProviderFactory.create("Provider Name", "Subscription URL"),
]

const internal = [
  { "type": "direct", "tag": "direct" },
  { "type": "block", "tag": "block" }
]

const server = createServer(async (req, client) => {
  const providers = await Promise.all(queue);

  const country = providers.map(p => p.byFlags()).map(p => p.toConfig())
  const endpoints = providers.map(p => p.toConfig())

  client.writeHead(200, { 'Content-Type': 'application/json' });
  client.end(JSON.stringify([...internal, ...country.flat(), ...endpoints.flat()], null, 2));
});

const PORT = 3000;
server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}/`);
});
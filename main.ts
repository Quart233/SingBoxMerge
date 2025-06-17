import { createServer } from "node:http"
import { ProviderFactory, Provider }  from "./types/provider.ts"

const template_url = "http://127.0.0.1:8080/template.json";

const queue: Promise<Provider>[] = [
  ProviderFactory.create("Provider Name", "Subscription URL"),
]

const server = createServer(async (req, client) => {
  const providers = await Promise.all(queue);

  console.log(providers);

  // Fetch template
  const templateRes = await fetch(template_url);
  const templateRaw = await templateRes.json();

  client.writeHead(200, { 'Content-Type': 'application/json' });
  client.end(JSON.stringify(templateRaw, null, 2));
});

const PORT = 3000;
server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}/`);
});
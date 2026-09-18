import * as Provider from "./providers/mod.ts";
import { Profile } from "./profiles/profile.ts";
import { parseArgs } from "jsr:@std/cli/parse-args";

const defaultTemplate = new URL("./templates/socks5.json", import.meta.url).href;
const defaultSubscription = "file:///home/lin/subscriptions/auska.json";
const defaultPort = 3000;
const defaultHost = "0.0.0.0";

const internal = [
  { type: "direct", tag: "DoH", domain_resolver: "DNSPod" },
  { type: "direct", tag: "direct" },
  { type: "block", tag: "block" },
];

function createProviders(url: string) {
  return [
    Provider.Region.json({
      name: "auska",
      url,
    }),
  ];
}

async function createProfile(template: string, subscription: string) {
  return await Profile.create({
    template,
    internalOutbounds: internal,
    providers: createProviders(subscription),
  });
}

const parsedArgs = parseArgs(Deno.args, {
  boolean: ["help"],
  string: ["port", "host", "template", "subscription"],
  alias: {
    p: "port",
    l: "host",
    listen: "host",
    h: "help",
    t: "template",
    s: "subscription",
  },
  default: {
    port: defaultPort.toString(),
    host: defaultHost,
    template: defaultTemplate,
    subscription: defaultSubscription,
  },
});

if (parsedArgs.help) {
  console.log(`Usage: deno run main.ts [command] [options]

Commands:
  server     Start the HTTP server
  generate   Generate the config

Options:
  -p, --port <port>        Port to listen on (default: ${defaultPort}) (for server)
  -l, --listen <host>      Host to listen on (default: ${defaultHost}) (for server)
  -t, --template <url>     Template URL (default: ${defaultTemplate})
  -s, --subscription <url> Subscription URL (default: ${defaultSubscription})
  -h, --help               Show this help message
`);
  Deno.exit(0);
}

const command = (parsedArgs._[0] as string) || "";

if (command === "server") {
  const port = Number(parsedArgs.port) || defaultPort;
  const hostname = parsedArgs.host || defaultHost;
  const profile = await createProfile(
    parsedArgs.template,
    parsedArgs.subscription,
  );
  Deno.serve({ port, hostname }, () => {
    const body = JSON.stringify(profile.generateConfig(), null, 2);
    return new Response(body, {
      status: 200,
      headers: {
        "content-type": "application/json; charset=utf-8",
      },
    });
  });
} else if (command === "generate") {
  const profile = await createProfile(
    parsedArgs.template,
    parsedArgs.subscription,
  );
  console.log(JSON.stringify(profile.generateConfig(), null, 2));
} else {
  console.error("Invalid command. Use --help for usage.");
  Deno.exit(1);
}

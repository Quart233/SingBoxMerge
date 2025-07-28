import * as Provider from "./providers"
import { Profile } from "./profiles/profile.ts"
import { IProvider } from "./providers/base.ts";
import { parseArgs } from "jsr:@std/cli/parse-args";

const defaultTemplate = "Support http:// or file://";
const defaultPort = 3000;

const providers: Promise<IProvider>[] = [
  Provider.RegExp.base64({
    name: "Provider Name",
    url: "Support http:// or file://",
  }),
  Provider.Region.base64({
    name: "Provider Name",
    url: "Support http:// or file://",
  })
]

const internal = [
  { type: "direct", tag: "direct" },
  { type: "block", tag: "block" },
];

const parsedArgs = parseArgs(Deno.args, {
  boolean: ["help"],
  string: ["port", "template"],
  alias: { h: "help", p: "port", t: "template" },
  default: { port: defaultPort.toString(), template: defaultTemplate },
});

if (parsedArgs.help) {
  console.log(`Usage: deno run main.ts [command] [options]

Commands:
  server     Start the HTTP server
  generate   Generate the config

Options:
  -p, --port <port>        Port to listen on (default: ${defaultPort}) (for server)
  -t, --template <url>     Template URL (default: ${defaultTemplate})
  -h, --help               Show this help message
`);
  Deno.exit(0);
}

const command = (parsedArgs._[0] as string) || "";

if (command === "server") {
  const port = Number(parsedArgs.port) || defaultPort;
  const template = parsedArgs.template;
  const profile = await Profile.create({
    template,
    internalOutbounds: internal,
    providers
  });
  Deno.serve({ port }, (req) => {
    const body = JSON.stringify(profile.generateConfig(), null, 2);
    return new Response(body, {
      status: 200,
      headers: {
        "content-type": "application/json; charset=utf-8",
      },
    });
  });
} else if (command === "generate") {
  const template = parsedArgs.template;
  const profile = await Profile.create({
    template,
    internalOutbounds: internal,
    providers
  });
  console.log(JSON.stringify(profile.generateConfig(), null, 2));
} else {
  console.error("Invalid command. Use --help for usage.");
  Deno.exit(1);
}
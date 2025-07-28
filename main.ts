import * as Provider from "./providers"
import { Profile } from "./profiles/profile.ts"
import { IProvider } from "./providers/base.ts";

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

const port = 3000;

Deno.serve({ port }, async (req, client) => {

  const profile = await Profile.create({
    template: "Support http:// or file://",
    internalOutbounds: internal,
    providers
  });

  const body = JSON.stringify(profile.generateConfig(), null, 2);
  return new Response(body, {
    status: 200,
    headers: {
      "content-type": "application/json; charset=utf-8",
    },
  });
});

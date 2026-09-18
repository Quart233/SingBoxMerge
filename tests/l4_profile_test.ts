import {
  assertEquals,
  assertStrictEquals,
  assertThrows,
} from "jsr:@std/assert";

import { Protocol } from "../outbounds/mod.ts";
import { Profile } from "../profiles/profile.ts";
import {
  internalOutbounds,
  leaf,
  sampleTemplate,
  StubProvider,
  withWarnCapture,
} from "./helpers.ts";

function makeProfile() {
  const provider = new StubProvider("src", [
    leaf("Japan | tokyo"),
    leaf("misc-node"),
  ]);
  return {
    provider,
    profile: Profile.fromResolved(sampleTemplate(), internalOutbounds, [
      provider,
    ]),
  };
}

Deno.test("L4 fromResolved: missing route throws", () => {
  assertThrows(
    () => Profile.fromResolved({} as never, internalOutbounds, []),
    Error,
    "missing route",
  );
});

Deno.test("L4 validateRules warns for rules without outbound", async () => {
  const { warnings } = await withWarnCapture(() => makeProfile());
  assertEquals(warnings.some((w) => w.includes("index 2")), true);
});

Deno.test("L4 generateConfig: outbound order, internal skip, template kept", async () => {
  const { value: { profile } } = await withWarnCapture(() => makeProfile());
  const template = sampleTemplate();
  const config = profile.generateConfig();
  const outbounds = config.outbounds as unknown as Array<
    Record<string, unknown>
  >;
  const tags = outbounds.map((o) => o.tag);

  assertEquals(tags, [
    "DoH",
    "direct",
    "block",
    "proxy",
    "Youtube",
    "src Japan",
    "src misc",
    "src",
    "Japan | tokyo",
    "misc-node",
  ]);

  const byTag = Object.fromEntries(outbounds.map((o) => [o.tag, o]));

  assertEquals(byTag.proxy, {
    tag: "proxy",
    type: Protocol.Selector,
    outbounds: ["src Japan", "src misc"],
  });
  assertEquals(byTag.Youtube.outbounds, ["src Japan", "src misc"]);
  assertEquals(byTag.src, {
    tag: "src",
    type: Protocol.URLTest,
    outbounds: ["Japan | tokyo", "misc-node"],
  });
  assertEquals(config.log, template.log);
  assertEquals(config.dns, template.dns);
  assertEquals(config.inbounds, template.inbounds);
  assertEquals(config.route.rules, template.route.rules);
});

Deno.test("L4 generateConfig mutates template and caches outbounds", async () => {
  const { value: { profile } } = await withWarnCapture(() => makeProfile());
  const first = profile.generateConfig();
  const cached = first.outbounds;
  const second = profile.generateConfig();

  assertStrictEquals(first, second);
  assertStrictEquals(second.outbounds, cached);

  profile.resetCache();
  const third = profile.generateConfig();
  assertStrictEquals(third, first);
  assertEquals(third.outbounds, cached);
  assertEquals(third.outbounds === cached, false);
});

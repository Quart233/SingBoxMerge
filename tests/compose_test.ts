import { assertEquals, assertRejects } from "jsr:@std/assert";

import { Protocol } from "../outbounds/mod.ts";
import { Profile } from "../profiles/profile.ts";
import { Region } from "../providers/region.ts";
import {
  internalOutbounds,
  sampleNodes,
  sampleTemplate,
  withWarnCapture,
  writeJsonFixture,
} from "./helpers.ts";

Deno.test("compose: Region.json reads file:// subscription", async () => {
  const dir = await Deno.makeTempDir();
  const url = await writeJsonFixture(dir, "nodes.json", sampleNodes());
  const provider = await Region.json({ name: "src", url });

  assertEquals(provider.name, "src");
  assertEquals(
    provider.outbounds.map((o) => o.config.tag),
    ["Japan | tokyo", "misc-node"],
  );
  assertEquals(
    provider.groups().map((g) => g.config.tag),
    ["src Japan", "src misc"],
  );
});

Deno.test("compose: Profile.create merges template file and provider", async () => {
  const dir = await Deno.makeTempDir();
  const nodes = await writeJsonFixture(dir, "nodes.json", sampleNodes());
  const template = await writeJsonFixture(dir, "tpl.json", sampleTemplate());

  const { value: profile } = await withWarnCapture(() =>
    Profile.create({
      template,
      internalOutbounds,
      providers: [Region.json({ name: "src", url: nodes })],
    })
  );
  const config = profile.generateConfig();
  const outbounds = config.outbounds as unknown as Array<
    Record<string, unknown>
  >;
  const tags = outbounds.map((o) => o.tag);

  assertEquals(tags.includes("Youtube"), true);
  assertEquals(tags.includes("src Japan"), true);
  assertEquals(tags.includes("Japan | tokyo"), true);
  assertEquals(config.route.final, "proxy");
  assertEquals(
    outbounds.find((o) => o.tag === "src")?.type,
    Protocol.URLTest,
  );
});

Deno.test("compose: Profile.create rejects template without route", async () => {
  const dir = await Deno.makeTempDir();
  const template = await writeJsonFixture(dir, "bad.json", { outbounds: [] });
  await assertRejects(
    () =>
      Profile.create({
        template,
        internalOutbounds,
        providers: [],
      }),
    Error,
    "missing route",
  );
});

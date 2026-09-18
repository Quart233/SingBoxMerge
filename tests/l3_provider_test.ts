import { assertEquals } from "jsr:@std/assert";

import { Protocol } from "../outbounds/mod.ts";
import { Region } from "../providers/region.ts";
import { RegExp } from "../providers/regex.ts";
import { leaf } from "./helpers.ts";

function groupTags(provider: Region | RegExp) {
  return provider.groups().map((g) => g.config.tag);
}

Deno.test("L3 Region.prefix: country name vs misc", () => {
  const provider = new Region("auska");
  provider.outbounds = [
    leaf("Japan | tokyo"),
    leaf("🇺🇸 BWH"),
    leaf("not-a-country"),
  ];
  assertEquals(groupTags(provider), [
    "auska Japan",
    "auska misc",
  ]);
});

Deno.test("L3 RegExp.prefix: flag emoji vs misc", () => {
  const provider = new RegExp("auska");
  provider.outbounds = [leaf("🇺🇸 BWH"), leaf("Japan | tokyo")];
  assertEquals(groupTags(provider), ["auska 🇺🇸", "auska misc"]);
});

Deno.test("L3 groups: same prefix share a selector tag", () => {
  const provider = new Region("auska");
  provider.outbounds = [
    leaf("Japan | a"),
    leaf("Japan | b"),
    leaf("misc-node"),
  ];

  const groups = provider.groups();
  assertEquals(
    groups.map((g) => g.config.tag),
    ["auska Japan", "auska misc"],
  );
  assertEquals(
    groups.map((g) => g.toConfig()),
    [
      {
        type: Protocol.Selector,
        tag: "auska Japan",
        outbounds: ["Japan | a", "Japan | b"],
      },
      {
        type: Protocol.Selector,
        tag: "auska misc",
        outbounds: ["misc-node"],
      },
    ],
  );
});

Deno.test("L3 toConfig: leaf endpoints only", () => {
  const provider = new Region("auska");
  provider.outbounds = [leaf("Japan | a"), leaf("misc-node")];
  assertEquals(provider.toConfig(), [
    { type: Protocol.Vless, tag: "Japan | a" },
    { type: Protocol.Vless, tag: "misc-node" },
  ]);
});

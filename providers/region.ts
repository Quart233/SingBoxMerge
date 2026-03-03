import { getNames } from "npm:country-list@2.3.0";

import { Provider } from "./base.ts";
import { Fields } from "./index.ts";
import { loadData } from "../utils/file.ts";
import { parseBase64, parseJson } from "../utils/parser.ts";

export class Region extends Provider {
  override prefix(t: string) {
    const keyword = t.split("|")[0].trim();
    const match = getNames().includes(keyword); // Keywords
    return match ? keyword : "misc";
  }

  static async base64(f: Fields) {
    const instance = new Region(f.name);
    const base64 = await loadData(f.url);
    instance.outbounds = parseBase64(base64);
    return instance;
  }

  static async json(f: Fields) {
    const instance = new Region(f.name, f.url);
    const json = await loadData(f.url);
    instance.outbounds = parseJson(json);
    return instance;
  }
}

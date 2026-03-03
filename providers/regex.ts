import { Provider } from "./base.ts";
import { Fields } from "./mod.ts";

import { parseJson, parseBase64 } from "../utils/parser.ts";
import { loadData } from "../utils/file.ts";

export class RegExp extends Provider {
  prefix(t: string) {
    const match = t.match(/[\u{1F1E6}-\u{1F1FF}]{2}/u); // Emoji flags
    return match ? match.toString() : "misc";
  }

  static async fromBase64 (f: Fields) {
    const instance = new RegExp(f.name);
    const base64 = await loadData(f.url);
    instance.outbounds = parseBase64(base64)
    return instance;
  }

  static async json(f: Fields) {
    const instance = new RegExp(f.name);
    const json = await loadData(f.url);
    instance.outbounds = parseJson(json);
    return instance;
  }
}

import { RegExp } from "./regex.ts";
import { Region } from "./region.ts";
import { Provider } from "./base.ts";

export interface Fields {
  name: string;
  url: string;
}

export { Provider, RegExp, Region };

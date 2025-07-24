import { getNames } from "npm:country-list@2.3.0"

import { Provider } from './base.ts'

export class Region extends Provider {
  override prefix(t: string) {
    const keyword = t.split('|')[0].trim();
    const match = getNames().includes(keyword) // Keywords
    return match? keyword: 'misc'
  }
}
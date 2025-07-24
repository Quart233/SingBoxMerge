import { Provider } from './base.ts'

export class RegExp extends Provider {
  override prefix (t: string) {
    const match = t.match(/[\u{1F1E6}-\u{1F1FF}]{2}/u) // Emoji flags
    return match? match.toString(): 'misc'
  }
}
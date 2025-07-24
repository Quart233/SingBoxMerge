import { RegExp } from './regex.ts'
import { Region } from './region.ts'

export interface Fields {
  name: string;
  url: string;
}

export const Provider = { RegExp, Region }

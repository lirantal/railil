import type { OutputFormatter } from './types.js'
import type { Travel } from '../types.js'

export class JsonFormatter implements OutputFormatter {
  format (data: Travel[]): string {
    return JSON.stringify(data, null, 2)
  }
}

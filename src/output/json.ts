import type { OutputFormatter } from './types.js'
import type { Travel, Station } from '../types.js'

export class JsonFormatter implements OutputFormatter {
  format (data: Travel[], from?: Station, to?: Station): string {
    if (from && to) {
      return JSON.stringify({
        from,
        to,
        travels: data
      }, null, 2)
    }
    return JSON.stringify(data, null, 2)
  }
}

import type { OutputFormatter } from './types.js'
import type { Travel, Station } from '../types.js'

export class MarkdownFormatter implements OutputFormatter {
  format (data: Travel[], from?: Station, to?: Station): string {
    let prefix = ''
    if (from && to) {
      prefix = `From: **${from.name.en}** - To: **${to.name.en}**\n\n`
    }

    if (data.length === 0) {
      return prefix + 'No trains found.'
    }

    const header = '| Departure | Arrival | Duration | Platform | Train # |'
    const separator = '|---|---|---|---|---|'
    const rows = data.map(t => {
      const dep = t.departureTime.replace('T', ' ').substring(0, 16) ?? 'N/A'
      const arr = t.arrivalTime.split('T')[1]?.substring(0, 5) ?? 'N/A'

      const depDate = new Date(t.departureTime)
      const arrDate = new Date(t.arrivalTime)
      const durationMs = arrDate.getTime() - depDate.getTime()
      const durationMins = Math.floor(durationMs / 60000)

      // Assuming direct train or first train for platform/number
      // The API structure has `trains` array (transfers?).
      // For simple display, let's show the first train's details or summary.
      const firstTrain = t.trains[0]
      const platform = firstTrain ? firstTrain.originPlatform : 'N/A'
      const trainNum = firstTrain ? firstTrain.trainNumber : 'N/A'

      return `| ${dep} | ${arr} | ${durationMins} min | ${platform} | ${trainNum} |`
    })

    return prefix + [header, separator, ...rows].join('\n')
  }
}

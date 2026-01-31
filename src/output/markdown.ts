import { stations } from '../data/stations.js'
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

    const header = '| Departure | Arrival | Duration | Platform | Train # | Route |'
    const separator = '|---|---|---|---|---|---|'
    const rows = data.map(t => {
      const dep = t.departureTime.replace('T', ' ').substring(0, 16) ?? 'N/A'
      const arr = t.arrivalTime.split('T')[1]?.substring(0, 5) ?? 'N/A'

      const depDate = new Date(t.departureTime)
      const arrDate = new Date(t.arrivalTime)
      const durationMs = arrDate.getTime() - depDate.getTime()
      const durationMins = Math.floor(durationMs / 60000)

      const platforms = t.trains.map(tr => tr.originPlatform).join(' ➔ ')
      const trainNums = t.trains.map(tr => {
        const lastStop = tr.routeStations[tr.routeStations.length - 1]
        if (lastStop) {
          const s = stations.find(st => st.id === String(lastStop.stationId))
          if (s) {
            return `${tr.trainNumber} (${s.name.he})`
          }
        }
        return tr.trainNumber
      }).join(' ➔ ')

      let route = 'Direct'
      if (t.trains.length > 1) {
        const interchanges = t.trains.slice(0, -1).map((tr, idx) => {
          const s = stations.find(st => st.id === String(tr.destinationStation))
          const name = s ? s.name.en : tr.destinationStation
          const nextTrain = t.trains[idx + 1]
          const samePlatform = nextTrain?.isSamePlatformIsland === 'Yes' ? ' (Same platform)' : ''
          return `${name}${samePlatform}`
        })
        route = `Via ${interchanges.join(', ')}`
      }

      return `| ${dep} | ${arr} | ${durationMins} min | ${platforms} | ${trainNums} | ${route} |`
    })

    const messages = new Set<string>()
    data.forEach(t => t.travelMessages?.forEach(m => messages.add(m)))

    let footer = ''
    if (messages.size > 0) {
      footer = '\n\n**Notes:**\n' + Array.from(messages).map(m => `- ${m}`).join('\n')
    }

    return prefix + [header, separator, ...rows].join('\n') + footer
  }
}

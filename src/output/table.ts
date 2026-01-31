import Table from 'cli-table3'
import { stations } from '../data/stations.js'
import type { OutputFormatter } from './types.js'
import type { Travel, Station } from '../types.js'

export class TableFormatter implements OutputFormatter {
  format (data: Travel[], from?: Station, to?: Station): string {
    let prefix = ''
    if (from && to) {
      prefix = `From: ${from.name.en} - To: ${to.name.en}\n`
    }

    if (data.length === 0) {
      return prefix + 'No trains found.'
    }

    const table = new Table({
      head: ['Departure', 'Arrival', 'Duration', 'Platform', 'Train #', 'Route'],
      style: { head: ['cyan'] }
    })

    data.forEach(t => {
      const dep = t.departureTime.replace('T', ' ').substring(0, 16) ?? 'N/A'
      const arr = t.arrivalTime.split('T')[1]?.substring(0, 5) ?? 'N/A'

      const depDate = new Date(t.departureTime)
      const arrDate = new Date(t.arrivalTime)
      const durationMs = arrDate.getTime() - depDate.getTime()
      const durationMins = Math.floor(durationMs / 60000)

      const platforms = t.trains.map(tr => tr.originPlatform).join(' ➔ ')
      const trainNums = t.trains.map(tr => tr.trainNumber).join(' ➔ ')

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

      table.push([dep, arr, `${durationMins} min`, platforms, trainNums, route])
    })

    const messages = new Set<string>()
    data.forEach(t => t.travelMessages?.forEach(m => messages.add(m)))

    let footer = ''
    if (messages.size > 0) {
      footer = '\n\nNotes:\n' + Array.from(messages).map(m => `- ${m}`).join('\n')
    }

    return prefix + table.toString() + footer
  }
}

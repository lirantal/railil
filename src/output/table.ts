import Table from 'cli-table3'
import type { OutputFormatter } from './types.js'
import type { Travel } from '../types.js'

export class TableFormatter implements OutputFormatter {
  format (data: Travel[]): string {
    if (data.length === 0) {
      return 'No trains found.'
    }

    const table = new Table({
      head: ['Departure', 'Arrival', 'Duration', 'Platform', 'Train #'],
      style: { head: ['cyan'] }
    })

    data.forEach(t => {
      const dep = t.departureTime.split('T')[1]?.substring(0, 5) ?? 'N/A'
      const arr = t.arrivalTime.split('T')[1]?.substring(0, 5) ?? 'N/A'

      const depDate = new Date(t.departureTime)
      const arrDate = new Date(t.arrivalTime)
      const durationMs = arrDate.getTime() - depDate.getTime()
      const durationMins = Math.floor(durationMs / 60000)

      const firstTrain = t.trains[0]
      const platform = firstTrain ? firstTrain.originPlatform : 'N/A'
      const trainNum = firstTrain ? firstTrain.trainNumber : 'N/A'

      table.push([dep, arr, `${durationMins} min`, platform, trainNum])
    })

    return table.toString()
  }
}

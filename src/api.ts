import { debuglog } from 'node:util'
import { stations } from './data/stations.js'
import type { RailResponse, SearchRequest, SearchResult } from './types.js'

const debug = debuglog('railil:api')

const API_ENDPOINT = 'https://rail-api.rail.co.il/rjpa/api/v1/timetable/searchTrain'
const API_KEY = '5e64d66cf03f4547bcac5de2de06b566'

export async function searchTrains (
  fromStationId: string,
  toStationId: string,
  date?: string,
  time?: string
): Promise<SearchResult> {
  // Default to today/now if not provided
  const now = new Date()
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Jerusalem',
    hour12: false,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
  const parts = formatter.format(now).split(', ')
  // parts[0] is YYYY-MM-DD, parts[1] is HH:MM

  const requestDate = date ?? parts[0] ?? ''
  const requestTime = time ?? parts[1] ?? ''

  const payload: SearchRequest = {
    methodName: 'searchTrainLuzForDateTime',
    fromStation: fromStationId,
    toStation: toStationId,
    date: requestDate,
    hour: requestTime,
    systemType: '2',
    scheduleType: 'ByDeparture',
    languageId: 'Hebrew' // The API seems to prefer this or English, but let's stick to the curl example
  }

  debug('Fetching schedule with payload:', payload)

  const response = await fetch(API_ENDPOINT, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      'ocp-apim-subscription-key': API_KEY
    },
    body: JSON.stringify(payload)
  })

  if (!response.ok) {
    throw new Error(`Rail API Error: ${response.status} ${response.statusText}`)
  }

  const data = (await response.json()) as RailResponse

  if (data.statusCode !== 200) {
    throw new Error(`Rail API returned error status: ${data.statusCode}`)
  }

  const from = stations.find(s => s.id === fromStationId)
  const to = stations.find(s => s.id === toStationId)

  // Although we expect IDs to be valid, we handle the case where they are not in our local list gracefully-ish
  // but strictly speaking, if we can't identify the station we can't fulfill the Promise<SearchResult> correctly regarding 'from' and 'to' types
  if (!from) throw new Error(`Station ID ${fromStationId} not found in local data`)
  if (!to) throw new Error(`Station ID ${toStationId} not found in local data`)

  // Filter out trains that have already departed relative to the requested time
  const targetISO = `${requestDate}T${requestTime}`
  const filteredTravels = data.result.travels.filter(t => t.departureTime >= targetISO)

  return {
    travels: filteredTravels,
    from,
    to
  }
}

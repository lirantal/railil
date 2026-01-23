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
  const requestDate = date ?? now.toISOString().split('T')[0] ?? '' // YYYY-MM-DD
  const requestTime = time ?? now.toTimeString().substring(0, 5) // HH:MM

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

  return {
    travels: data.result.travels,
    from,
    to
  }
}

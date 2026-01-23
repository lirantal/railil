import { debuglog } from 'node:util'
import type { RailResponse, SearchRequest, Travel } from './types.js'

const debug = debuglog('railil:api')

const API_ENDPOINT = 'https://rail-api.rail.co.il/rjpa/api/v1/timetable/searchTrain'
const API_KEY = '5e64d66cf03f4547bcac5de2de06b566'

export async function searchTrains (
  fromStation: string,
  toStation: string,
  date?: string,
  time?: string
): Promise<Travel[]> {
  // Default to today/now if not provided
  const now = new Date()
  const requestDate = date ?? now.toISOString().split('T')[0] ?? '' // YYYY-MM-DD
  const requestTime = time ?? now.toTimeString().substring(0, 5) // HH:MM

  const payload: SearchRequest = {
    methodName: 'searchTrainLuzForDateTime',
    fromStation,
    toStation,
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

  return data.result.travels
}

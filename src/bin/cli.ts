#!/usr/bin/env node
import { parseArgs } from 'node:util'
import Fuse from 'fuse.js'
import { stations } from '../data/stations.js'
import { searchTrains } from '../api.js'
import { JsonFormatter } from '../output/json.js'
import { MarkdownFormatter } from '../output/markdown.js'
import { TableFormatter } from '../output/table.js'

async function main () {
  const options = {
    from: { type: 'string', short: 'f' },
    to: { type: 'string', short: 't' },
    date: { type: 'string', short: 'd' },
    time: { type: 'string' },
    json: { type: 'boolean' },
    output: { type: 'string', short: 'o' },
    limit: { type: 'string', default: '5' }, // parseArgs doesn't strictly type numbers yet in all versions, safe to parse as string then int
    help: { type: 'boolean', short: 'h' }
  } as const

  const { values } = parseArgs({
    options,
    strict: true,
    allowPositionals: false,
  })

  if (values.help) {
    console.log(`
Usage: railil [options]

Options:
  -f, --from <station>   Origin station name or ID (required)
  -t, --to <station>     Destination station name or ID (required)
  -d, --date <date>      Date (YYYY-MM-DD), defaults to today
  --time <time>          Time (HH:MM), defaults to now
  --json                 Output JSON (alias for --output json)
  -o, --output <format>  Output format: table, markdown, json (default: markdown)
  --limit <number>       Number of results to show (default: 5)
  -h, --help             Show this help message
    `)
    process.exit(0)
  }

  if (!values.from || !values.to) {
    console.error('Error: --from and --to are required.')
    process.exit(1)
  }

  // Station Resolution
  const resolveStation = (input: string) => {
    // Direct ID match
    const direct = stations.find(s => s.id === input)
    if (direct) return direct

    // Fuzzy Search
    const fuse = new Fuse(stations, {
      keys: ['name.en', 'name.he', 'name.ru', 'name.ar'],
      threshold: 0.3
    })
    const result = fuse.search(input)

    if (result.length > 0 && result[0]) {
      return result[0].item
    }
    return null
  }

  const fromStation = resolveStation(values.from)
  const toStation = resolveStation(values.to)

  if (!fromStation) {
    console.error(`Error: Could not find station matching "${values.from}"`)
    process.exit(1)
  }

  if (!toStation) {
    console.error(`Error: Could not find station matching "${values.to}"`)
    process.exit(1)
  }

  // Fetch Data
  try {
    const { travels, from, to } = await searchTrains(
      fromStation.id,
      toStation.id,
      values.date,
      values.time
    )

    // Limit results
    const limit = parseInt(values.limit || '5', 10)
    const limitedResults = travels.slice(0, limit)

    // Format Output
    const format = values.json ? 'json' : (values.output || 'markdown')
    let output = ''

    switch (format) {
      case 'json':
        output = new JsonFormatter().format(limitedResults, from, to)
        break
      case 'table':
        output = new TableFormatter().format(limitedResults, from, to)
        break
      case 'markdown':
      default:
        output = new MarkdownFormatter().format(limitedResults, from, to)
        break
    }

    console.log(output)
  } catch (error) {
    console.error('Error fetching trains:', error instanceof Error ? error.message : error)
    process.exit(1)
  }
}

main().catch(console.error)

# railil

> A modern, type-safe Node.js CLI and API client for Israel Railways.

`railil` allows you to query train schedules directly from your terminal or integrate Israel Rail data into your Node.js applications. It features fuzzy station searching, multiple output formats, and a zero-dependency architecture (runtime).

<p align="center">
  <a href="https://www.npmjs.org/package/railil"><img src="https://badgen.net/npm/v/railil" alt="npm version"/></a>
  <a href="https://www.npmjs.org/package/railil"><img src="https://badgen.net/npm/license/railil" alt="license"/></a>
  <a href="https://github.com/lirantal/railil/actions?workflow=CI"><img src="https://github.com/lirantal/railil/workflows/CI/badge.svg" alt="build"/></a>
</p>

## Features
* **🚄 CLI & API**: Use it as a command-line tool or a library.
*   **🔄 Transfer Support**: Detailed visibility for journeys requiring transfers or bus substitutions.
*   **🔍 Fuzzy Search**: Smart matching for station names (e.g., "Savidor", "Modiin").

* **⏰ Smart Scheduling**: Automatically finds upcoming trains starting from "now" (Israel time), filtering out past departures.
* **🎨 Flexible Output**: JSON (for piping), Markdown (for notes), or beautiful CLI Tables.
* **⚡ Modern**: Built with Node.js 22+ native `fetch` and ESM.
* **📦 Type-Safe**: Written in TypeScript with full type definitions.

## Installation

### CLI Usage

You can run it directly using `npx` without installation:

```bash
npx railil --from "Tel Aviv Savidor" --to "Haifa"
```

Or install globally:

```bash
npm install -g railil
```

### Library Usage

Install as a dependency in your project:

```bash
npm install railil
```

## CLI Reference

### Options

| Flag | Short | Type | Description | Default |
|------|-------|------|-------------|---------|
| `--from` | `-f` | string | **Required**. Origin station name or ID. Supports fuzzy matching. | - |
| `--to` | `-t` | string | **Required**. Destination station name or ID. Supports fuzzy matching. | - |
| `--date` | `-d` | string | Date in `YYYY-MM-DD` format. | Today (Israel) |
| `--time` | | string | Time in `HH:MM` format. | Now (Israel) |
| `--limit`| | number | Number of results to display. | `5` |
| `--output`| `-o` | string | Output format: `markdown`, `table`, `json`. | `markdown` |
| `--json` | | boolean| Alias for `--output json`. | `false` |
| `--help` | `-h` | boolean| Show help message. | - |

### Examples

Search for the next 5 trains from **Tel Aviv Savidor** to **Haifa Hof HaKarmel** (starting from now):

```bash
railil --from "Savidor" --to "Hof Carmel"
```

Search for a specific time and date:

```bash
# Next trains after 16:30 today
railil -f "Tel Aviv" -t "Haifa" --time 16:30

# Specific date and time
railil -f "Modiin" -t "Jerusalem" --date 2026-02-01 --time 08:00
```

Output as a CLI Table:

```bash
railil -f "Modiin" -t "Jerusalem" --output table
```

Output as JSON (useful for scripts/automation):

```bash
railil -f 5800 -t 4600 --json
```

## API Reference

```typescript
import { searchTrains, stations } from 'railil';

// 1. Search for trains
const { travels, from, to } = await searchTrains(
  '3700', // Tel Aviv Savidor Center (ID)
  '2300'  // Haifa - Hof HaKarmel (ID)
);

console.log(`Searching from ${from.name.en} to ${to.name.en}`);
console.log(`Next train leaves at: ${travels[0].departureTime}`);

// 2. Lookup station IDs
const station = stations.find(s => s.name.en.includes('Savidor'));
console.log(station.id); // "3700"
```

See [API Documentation](docs/api.md) for full reference.

## Development

1. **Clone**: `git clone https://github.com/lirantal/railil.git`
2. **Install**: `npm install`
3. **Build**: `npm run build`
4. **Test**: `npm test`
5. **Run CLI**:
    * **Development**: `npm start -- -f "Modiin" -t "Savidor"`
    * **Production**: `node dist/bin/cli.cjs -f "Modiin" -t "Savidor"`

## License

Apache-2.0

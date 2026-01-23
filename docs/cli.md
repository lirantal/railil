# CLI Reference

The `railil` command line interface provides a robust way to query train schedules.

## Usage

```bash
railil [options]
```

## Options

| Flag | Short | Type | Description | Default |
|------|-------|------|-------------|---------|
| `--from` | `-f` | string | **Required**. Origin station name or ID. Supports fuzzy matching. | - |
| `--to` | `-t` | string | **Required**. Destination station name or ID. Supports fuzzy matching. | - |
| `--date` | `-d` | string | Date in `YYYY-MM-DD` format. | Today |
| `--time` | | string | Time in `HH:MM` format. | Now |
| `--limit`| | number | Number of results to display. | `5` |
| `--output`| `-o` | string | Output format: `markdown`, `table`, `json`. | `markdown` |
| `--json` | | boolean| Alias for `--output json`. | `false` |
| `--help` | `-h` | boolean| Show help message. | - |

## Examples

### Basic Search
Search for trains from **Modiin** to **Tel Aviv**:
```bash
railil --from "Modiin" --to "Tel Aviv"
```

### Specific Date and Time
Search for trains tomorrow at 8:00 AM:
```bash
railil -f "Savidor" -t "Haifa" --date 2026-01-24 --time 08:00
```

### Table Output
Display results in a formatted terminal table:
```bash
railil -f "Beer Sheva" -t "Tel Aviv" -o table
```

### JSON Output
Get raw JSON data for processing with `jq` or other tools:
```bash
railil -f 5800 -t 4600 --json | jq '.travels[0].departureTime'
```

### Fuzzy Matching
You don't need exact station names. The CLI matches English, Hebrew, Russian, and Arabic names:
*   `"Savidor"` matches "Tel Aviv - Savidor Center"
*   `"Hof Carmel"` matches "Haifa - Hof HaKarmel"
*   `"Mosh"` matches "Moshava" (likely)

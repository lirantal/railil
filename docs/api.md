# API Reference

`railil` exports a fully typed API for use in Node.js applications.

## `searchTrains(from, to, date?, time?)`

Fetches the train schedule between two stations.

### Signature

```typescript
function searchTrains(
  fromStation: string, 
  toStation: string, 
  date?: string, 
  time?: string
): Promise<Travel[]>
```

### Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `fromStation` | `string` | Yes | The Station ID (e.g., "3700"). Use the `stations` export to find IDs. |
| `toStation` | `string` | Yes | The Station ID. |
| `date` | `string` | No | Date in `YYYY-MM-DD` format. Defaults to today. |
| `time` | `string` | No | Time in `HH:MM` format. Defaults to current time. |

### Returns

Returns a `Promise` that resolves to an array of `Travel` objects.

## `stations`

An array of all available stations, including their IDs and names in multiple languages.

### Structure

```typescript
interface Station {
  id: string;
  name: {
    he: string; // Hebrew
    en: string; // English
    ru: string; // Russian
    ar: string; // Arabic
  };
}
```

### Example Usage

```typescript
import { stations } from 'railil';

const myStation = stations.find(s => s.name.en === 'Tel Aviv - Savidor Center');
console.log(myStation.id); // "3700"
```

## Types

### `Travel`

Represents a specific journey option found by the search.

```typescript
interface Travel {
  departureTime: string; // ISO 8601
  arrivalTime: string;   // ISO 8601
  freeSeats?: number;
  trains: Train[];       // Array of trains involved (handling transfers)
}
```

### `Train`

Represents a specific train leg within a journey.

```typescript
interface Train {
  trainNumber: number;
  orignStation: number;
  destinationStation: number;
  originPlatform: number;
  destPlatform: number;
  arrivalTime: string;
  departureTime: string;
  stopStations: StationInfo[];
  // ... other properties
}
```

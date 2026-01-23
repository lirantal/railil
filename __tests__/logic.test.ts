import { describe, it } from 'node:test';
import assert from 'node:assert';
import Fuse from 'fuse.js';
import { stations } from '../src/data/stations.js';
import { MarkdownFormatter } from '../src/output/markdown.js';
import type { Travel } from '../src/types.js';

describe('Station Fuzzy Search', () => {
  const fuse = new Fuse(stations, {
    keys: ['name.en', 'name.he', 'name.ru', 'name.ar'],
    threshold: 0.3
  });

  it('should resolve "Tel Aviv" to a Tel Aviv station', () => {
    const result = fuse.search('Tel Aviv');
    assert.ok(result.length > 0);
    assert.ok(result[0].item.name.en.includes('Tel Aviv'));
  });

  it('should resolve "Savidor" to Tel Aviv Savidor', () => {
    const result = fuse.search('Savidor');
    assert.ok(result.length > 0);
    assert.ok(result[0].item.name.en.includes('Savidor'));
  });

  it('should resolve "Modiin" correctly', () => {
    const result = fuse.search('Modiin');
    assert.ok(result.length > 0);
    assert.ok(result[0].item.name.en.includes('Modi\'in'));
  });
});

describe('Formatters', () => {
  it('MarkdownFormatter should handle empty data', () => {
    const formatter = new MarkdownFormatter();
    assert.strictEqual(formatter.format([]), 'No trains found.');
  });

  it('MarkdownFormatter should format train data', () => {
    const formatter = new MarkdownFormatter();
    const mockData: Travel[] = [{
      departureTime: '2023-10-10T12:00:00',
      arrivalTime: '2023-10-10T12:30:00',
      trains: [{
        trainNumber: 123,
        orignStation: 1,
        destinationStation: 2,
        originPlatform: 5,
        destPlatform: 6,
        arrivalTime: '2023-10-10T12:30:00',
        departureTime: '2023-10-10T12:00:00',
        stopStations: [],
        routeStations: [],
        handicap: 1,
        isSamePlatformIsland: 'No'
      }]
    }];

    const output = formatter.format(mockData);
    assert.ok(output.includes('| 2023-10-10 12:00 | 12:30 | 30 min | 5 | 123 |'));
  });

  it('MarkdownFormatter should include station names if provided', () => {
    const formatter = new MarkdownFormatter();
    const mockData: Travel[] = [];
    // Mock stations
    const fromStation = { id: '1', name: { en: 'A', he: 'A', ru: 'A', ar: 'A' } };
    const toStation = { id: '2', name: { en: 'B', he: 'B', ru: 'B', ar: 'B' } };
    
    const output = formatter.format(mockData, fromStation, toStation);
    assert.ok(output.includes(`From: **${fromStation.name.en}** - To: **${toStation.name.en}**`));
  });
});

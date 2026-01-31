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
      travelMessages: [],
      trains: [{
        trainNumber: 123,
        orignStation: 1,
        destinationStation: 2,
        originPlatform: 5,
        destPlatform: 6,
        arrivalTime: '2023-10-10T12:30:00',
        departureTime: '2023-10-10T12:00:00',
        stopStations: [],
        routeStations: [{ stationId: 3500, arrivalTime: '12:30', departureTime: '12:30', platform: 1 }],
        handicap: 1,
        isSamePlatformIsland: 'No'
      }]
    }];

    const output = formatter.format(mockData);
    assert.ok(output.includes('| 2023-10-10 12:00 | 12:30 | 30 min | 5 | 123 (הרצליה) | Direct |'));
  });

  it('MarkdownFormatter should format train data with transfers', () => {
    const formatter = new MarkdownFormatter();
    const mockData: Travel[] = [{
      departureTime: '2023-10-10T12:00:00',
      arrivalTime: '2023-10-10T13:00:00',
      travelMessages: ['Test message'],
      trains: [
        {
          trainNumber: 123,
          orignStation: 5800,
          destinationStation: 4900,
          originPlatform: 1,
          destPlatform: 4,
          arrivalTime: '2023-10-10T12:40:00',
          departureTime: '2023-10-10T12:00:00',
          stopStations: [],
          routeStations: [{ stationId: 3500, arrivalTime: '12:40', departureTime: '12:40', platform: 1 }],
          handicap: 1,
          isSamePlatformIsland: 'No'
        },
        {
          trainNumber: 456,
          orignStation: 4900,
          destinationStation: 8600,
          originPlatform: 3,
          destPlatform: 1,
          arrivalTime: '2023-10-10T13:00:00',
          departureTime: '2023-10-10T12:45:00',
          stopStations: [],
          routeStations: [{ stationId: 680, arrivalTime: '13:00', departureTime: '13:00', platform: 1 }],
          handicap: 1,
          isSamePlatformIsland: 'Yes'
        }
      ]
    }];

    const output = formatter.format(mockData);
    assert.ok(output.includes('| 2023-10-10 12:00 | 13:00 | 60 min | 1 ➔ 3 | 123 (הרצליה) ➔ 456 (ירושלים - יצחק נבון) | Via Tel Aviv-HaHagana (Same platform) |'));
    assert.ok(output.includes('**Notes:**'));
    assert.ok(output.includes('- Test message'));
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

import type { Travel, Station } from '../types.js'

export interface OutputFormatter {
  format(data: Travel[], from?: Station, to?: Station): string;
}

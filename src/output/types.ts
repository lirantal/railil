import type { Travel } from '../types.js'

export interface OutputFormatter {
  format(data: Travel[]): string;
}

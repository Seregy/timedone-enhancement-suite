/**
 * HTML element resolution timed out error
 */
export class ResolutionTimeoutError extends Error {
  /**
   * Constructs new error instance
   */
  constructor() {
    super('Failed to resolve an HTML element due to a timeout');
  }
}

/**
 * Creates paginated results.
 */
export class Pagination {
  constructor(args: any = {}) {
    Object.assign(this, args);
  }

  /**
   * The number of documents available that match the search filter.
   */
  count = 0;

  /**
   * Paginated content returned.
   */
  content = [];
}

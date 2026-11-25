export interface BoardRow {
  category: string;
  region: string;
  endDate: string;
  search: string;
  hasCode: boolean;
}

export interface BoardState {
  region: string;
  category: string;
  query: string;
  codeOnly: boolean;
}

export interface BoardResult {
  visible: boolean[];
  counts: { all: number; byCategory: Record<string, number>; withCode: number };
}

/** A YYYY-MM-DD deal stays live until 23:59:59.999 local time on its end day. */
export function isExpired(endDate: string | null | undefined, today: Date): boolean {
  if (!endDate) return false;
  const [y, m, d] = endDate.split('-').map(Number);
  if (!y || !m || !d) return false;
  return today > new Date(y, m - 1, d, 23, 59, 59, 999);
}

export function matchesRegion(region: string, filter: string): boolean {
  return filter === 'all' || region === 'both' || region === filter;
}

/** Which rows show, plus chip counts computed from live rows rather than build-time totals. */
export function filterBoard(rows: readonly BoardRow[], state: BoardState, today: Date): BoardResult {
  const byCategory: Record<string, number> = {};
  let all = 0;
  let withCode = 0;
  const visible = rows.map((row) => {
    const base =
      !isExpired(row.endDate, today) &&
      matchesRegion(row.region, state.region) &&
      (!state.query || row.search.includes(state.query));
    const categoryOk = state.category === 'all' || row.category === state.category;
    const codeOk = !state.codeOnly || row.hasCode;
    if (base && codeOk) {
      all += 1;
      byCategory[row.category] = (byCategory[row.category] ?? 0) + 1;
    }
    if (base && categoryOk && row.hasCode) withCode += 1;
    return base && categoryOk && codeOk;
  });
  return { visible, counts: { all, byCategory, withCode } };
}

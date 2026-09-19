export interface HistoryCursor {
  /** Sort-column value of the last row on the previous page. */
  v: string | number | null;
  /** Id of the last row (unique tiebreaker). */
  i: string;
}

export function encodeCursor(v: HistoryCursor["v"], id: string): string {
  return Buffer.from(JSON.stringify({ v, i: id }), "utf8").toString("base64url");
}

export function decodeCursor(cursor: string): HistoryCursor | null {
  try {
    const parsed = JSON.parse(
      Buffer.from(cursor, "base64url").toString("utf8"),
    ) as { v?: unknown; i?: unknown };
    if (
      typeof parsed.i !== "string" ||
      (typeof parsed.v !== "string" &&
        typeof parsed.v !== "number" &&
        parsed.v !== null)
    ) {
      return null;
    }
    return { v: parsed.v, i: parsed.i };
  } catch {
    return null;
  }
}
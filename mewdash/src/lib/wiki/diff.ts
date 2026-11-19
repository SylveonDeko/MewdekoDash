export type DiffKind = "same" | "add" | "del";

export interface DiffOp {
  kind: DiffKind;
  text: string;
}

/** Above this many table cells the middle of the text is shown as one replaced block. */
const maxCells = 4_000_000;

/**
 * Line diff between two texts. Equal lines at both ends are trimmed first, then the middle is
 * aligned with a longest common subsequence.
 *
 * @param before The older text.
 * @param after The newer text.
 * @returns The lines in order, each marked as unchanged, added or deleted.
 */
export function diffLines(before: string, after: string): DiffOp[] {
  const a = before === "" ? [] : before.split("\n");
  const b = after === "" ? [] : after.split("\n");

  let start = 0;
  while (start < a.length && start < b.length && a[start] === b[start]) start++;
  let endA = a.length;
  let endB = b.length;
  while (endA > start && endB > start && a[endA - 1] === b[endB - 1]) {
    endA--;
    endB--;
  }

  const ops: DiffOp[] = [];
  for (let i = 0; i < start; i++) ops.push({ kind: "same", text: a[i] });

  const midA = a.slice(start, endA);
  const midB = b.slice(start, endB);
  ops.push(...diffMiddle(midA, midB));

  for (let i = endA; i < a.length; i++) ops.push({ kind: "same", text: a[i] });
  return ops;
}

function diffMiddle(a: string[], b: string[]): DiffOp[] {
  if (a.length === 0) return b.map((text) => ({ kind: "add", text }));
  if (b.length === 0) return a.map((text) => ({ kind: "del", text }));
  if ((a.length + 1) * (b.length + 1) > maxCells) {
    return [...a.map((text): DiffOp => ({ kind: "del", text })), ...b.map((text): DiffOp => ({ kind: "add", text }))];
  }

  const width = b.length + 1;
  const table = new Uint32Array((a.length + 1) * width);
  for (let i = a.length - 1; i >= 0; i--) {
    for (let j = b.length - 1; j >= 0; j--) {
      table[i * width + j] =
        a[i] === b[j]
          ? table[(i + 1) * width + j + 1] + 1
          : Math.max(table[(i + 1) * width + j], table[i * width + j + 1]);
    }
  }

  const ops: DiffOp[] = [];
  let i = 0;
  let j = 0;
  while (i < a.length && j < b.length) {
    if (a[i] === b[j]) {
      ops.push({ kind: "same", text: a[i] });
      i++;
      j++;
    } else if (table[(i + 1) * width + j] >= table[i * width + j + 1]) {
      ops.push({ kind: "del", text: a[i++] });
    } else {
      ops.push({ kind: "add", text: b[j++] });
    }
  }
  while (i < a.length) ops.push({ kind: "del", text: a[i++] });
  while (j < b.length) ops.push({ kind: "add", text: b[j++] });
  return ops;
}

/** Counts of added and deleted lines in a diff. */
export function diffStats(ops: DiffOp[]): { added: number; deleted: number } {
  let added = 0;
  let deleted = 0;
  for (const op of ops) {
    if (op.kind === "add") added++;
    else if (op.kind === "del") deleted++;
  }
  return { added, deleted };
}

/**
 * Cuts a long diff down to the changed lines and a few lines of context around them.
 *
 * @param ops The full diff.
 * @param context Unchanged lines to keep on each side of a change.
 * @returns Chunks of consecutive lines. A gap between chunks means unchanged lines were left out.
 */
export function collapseDiff(ops: DiffOp[], context = 2): DiffOp[][] {
  const keep = new Array<boolean>(ops.length).fill(false);
  ops.forEach((op, index) => {
    if (op.kind === "same") return;
    for (let k = Math.max(0, index - context); k <= Math.min(ops.length - 1, index + context); k++) keep[k] = true;
  });

  const chunks: DiffOp[][] = [];
  let current: DiffOp[] = [];
  ops.forEach((op, index) => {
    if (keep[index]) {
      current.push(op);
    } else if (current.length > 0) {
      chunks.push(current);
      current = [];
    }
  });
  if (current.length > 0) chunks.push(current);
  return chunks;
}

export interface VersionText {
  title: string;
  summary: string;
  tags: string[];
  markdown: string;
}

export type DiffField = "title" | "summary" | "tags" | "markdown";

export interface FieldDiff {
  field: DiffField;
  ops: DiffOp[];
}

/**
 * Diffs two versions field by field. Fields that did not change are left out.
 *
 * @param before The older version, or null when there is none.
 * @param after The newer version.
 */
export function diffVersions(before: VersionText | null, after: VersionText): FieldDiff[] {
  const empty: VersionText = { title: "", summary: "", tags: [], markdown: "" };
  const old = before ?? empty;
  const fields: Array<[DiffField, string, string]> = [
    ["title", old.title, after.title],
    ["summary", old.summary, after.summary],
    ["tags", old.tags.join(", "), after.tags.join(", ")],
    ["markdown", old.markdown, after.markdown],
  ];
  const result: FieldDiff[] = [];
  for (const [field, a, b] of fields) {
    if (a === b) continue;
    result.push({ field, ops: diffLines(a, b) });
  }
  return result;
}

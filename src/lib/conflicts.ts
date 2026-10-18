export type Slot = { code: string; sec: string; day: number; start: number; end: number; midterm?: string | undefined; final?: string | undefined };

export const overlaps = (a: Slot, b: Slot) => a.day === b.day && a.start < b.end && b.start < a.end;

export function timeConflicts(slots: Slot[]) {
  const out: [Slot, Slot][] = [];
  for (let i = 0; i < slots.length; i++)
    for (let j = i + 1; j < slots.length; j++) if (overlaps(slots[i]!, slots[j]!)) out.push([slots[i]!, slots[j]!]);
  return out;
}

export function examConflicts(slots: Slot[], kind: "midterm" | "final") {
  const out: [Slot, Slot][] = [];
  for (let i = 0; i < slots.length; i++)
    for (let j = i + 1; j < slots.length; j++) {
      const a = slots[i]![kind], b = slots[j]![kind];
      if (a && b && a === b) out.push([slots[i]!, slots[j]!]);
    }
  return out;
}

export const missingExam = (slots: Slot[]) => slots.filter((s) => !s.midterm || !s.final);

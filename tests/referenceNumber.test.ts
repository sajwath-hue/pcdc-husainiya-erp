import { describe, it, expect } from "vitest";
import { generateLoanReferenceNumber, generateNoticeNumber } from "@/lib/loan/referenceNumber";

// Minimal fake of the Prisma tx surface referenceNumber.ts relies on
// (an upsert-based counter), so this stays a pure unit test.
function makeFakeTx() {
  const store = new Map<string, number>();
  return {
    sequenceCounter: {
      async upsert({ where, update }: { where: { key: string }; create: { key: string; value: number }; update: unknown }) {
        const current = store.get(where.key);
        const next = current === undefined ? 1 : current + (update ? 1 : 0);
        store.set(where.key, next);
        return { key: where.key, value: next };
      },
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } as any;
}

describe("generateLoanReferenceNumber", () => {
  it("produces PCDC-LN-<year>-0001 format, zero-padded to 4 digits", async () => {
    const tx = makeFakeTx();
    const ref = await generateLoanReferenceNumber(tx, new Date(2026, 0, 1));
    expect(ref).toBe("PCDC-LN-2026-0001");
  });

  it("increments sequentially within the same year and resets per year", async () => {
    const tx = makeFakeTx();
    const ref1 = await generateLoanReferenceNumber(tx, new Date(2026, 0, 1));
    const ref2 = await generateLoanReferenceNumber(tx, new Date(2026, 5, 1));
    const ref3 = await generateLoanReferenceNumber(tx, new Date(2027, 0, 1));
    expect(ref1).toBe("PCDC-LN-2026-0001");
    expect(ref2).toBe("PCDC-LN-2026-0002");
    expect(ref3).toBe("PCDC-LN-2027-0001"); // new year -> sequence resets
  });
});

describe("generateNoticeNumber", () => {
  it("produces PCDC-NT-<year>-0001 format", async () => {
    const tx = makeFakeTx();
    const ref = await generateNoticeNumber(tx, new Date(2026, 0, 1));
    expect(ref).toBe("PCDC-NT-2026-0001");
  });
});

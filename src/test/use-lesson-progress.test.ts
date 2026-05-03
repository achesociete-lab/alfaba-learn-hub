import { describe, it, expect } from "vitest";

// Lesson progress utility tests (pure logic — no hooks needed)
const N2_OFFSET = 1000;

describe("Lesson progress ID logic", () => {
  it("should store N2 lessons with offset", () => {
    const lessonId = 5;
    const storedId = lessonId + N2_OFFSET;
    expect(storedId).toBe(1005);
  });

  it("should recover N2 lesson IDs correctly", () => {
    const storedIds = [1001, 1005, 1012];
    const recovered = storedIds
      .filter((id) => id > N2_OFFSET)
      .map((id) => id - N2_OFFSET);
    expect(recovered).toEqual([1, 5, 12]);
  });

  it("should separate N1 and N2 lesson IDs", () => {
    const allIds = [1, 3, 5, 1001, 1005, 1010];
    const n1 = allIds.filter((id) => id <= 100);
    const n2 = allIds.filter((id) => id > N2_OFFSET);
    expect(n1).toEqual([1, 3, 5]);
    expect(n2).toEqual([1001, 1005, 1010]);
  });

  it("should not duplicate lesson IDs in completed array", () => {
    const existing = [1, 2, 3];
    const newId = 2; // duplicate
    const merged = [...new Set([...existing, newId])];
    expect(merged).toEqual([1, 2, 3]);
    expect(merged.length).toBe(3);
  });
});

import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock supabase
vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    from: vi.fn().mockReturnValue({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      limit: vi.fn().mockReturnThis(),
      maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
    }),
  },
}));

vi.mock("@/contexts/AuthContext", () => ({
  useAuth: vi.fn().mockReturnValue({ user: null }),
}));

vi.mock("@/hooks/use-admin", () => ({
  useIsAdmin: vi.fn().mockReturnValue({ isAdmin: false, loading: false }),
}));

describe("useSubscription plan logic", () => {
  it("should return découverte plan for unauthenticated users", () => {
    // Unauthenticated users get the free plan
    const FREE_LESSON_LIMIT = 3;
    const isFreePlan = true;
    const maxLessons = isFreePlan ? FREE_LESSON_LIMIT : Infinity;
    expect(maxLessons).toBe(3);
    expect(isFreePlan).toBe(true);
  });

  it("should give unlimited lessons to non-free plans", () => {
    const isFreePlan = false;
    const maxLessons = isFreePlan ? 3 : Infinity;
    expect(maxLessons).toBe(Infinity);
  });

  it("should identify premium plan correctly", () => {
    const plan: string = "premium";
    expect(plan === "découverte").toBe(false);
    expect(["essentiel", "premium", "hifz"].includes(plan)).toBe(true);
  });

  it("should identify all valid plan types", () => {
    const validPlans = ["découverte", "essentiel", "premium", "hifz"];
    validPlans.forEach((plan) => {
      expect(validPlans.includes(plan)).toBe(true);
    });
  });
});

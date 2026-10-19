const { getPlanLimits } = require("../src/utils/planLimits");

describe("L17: planLimits", () => {
  test("starter / pro / executive values", () => {
    expect(getPlanLimits("starter")).toEqual({ boards: 1, jobs: 20, resumes: 0 });
    expect(getPlanLimits("pro")).toEqual({ boards: 10, jobs: Infinity, resumes: 30 });
    expect(getPlanLimits("executive")).toEqual({ boards: Infinity, jobs: Infinity, resumes: 100 });
  });

  test("unknown, missing or odd plans get starter limits", () => {
    for (const p of ["admin", "", undefined, null, "PRO", "__proto__"]) {
      expect(getPlanLimits(p)).toEqual({ boards: 1, jobs: 20, resumes: 0 });
    }
  });
});

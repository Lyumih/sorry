import { describe, expect, it } from "vitest";
import { buildApologyNarrative } from "./apologyNarrative.ts";

const base = {
  toWhom: "Анна",
  reason: "опоздание",
  reflection: "слушать внимательнее",
};

describe("buildApologyNarrative", () => {
  it("i_said male: извинился, без скобок", () => {
    const s = buildApologyNarrative({ ...base, direction: "i_said" }, "male");
    expect(s).toContain("Я извинился перед");
    expect(s).not.toContain("извинилась");
    expect(s).not.toContain("(лась)");
    expect(s).toContain("Анна");
    expect(s).toContain("опоздание");
  });

  it("i_said female: извинилась", () => {
    const s = buildApologyNarrative({ ...base, direction: "i_said" }, "female");
    expect(s).toContain("Я извинилась перед");
    expect(s).not.toContain("извинился перед");
  });

  it("said_to_me: скобочная форма глагола, без попросили прощения", () => {
    const s = buildApologyNarrative({ ...base, direction: "said_to_me" }, "male");
    expect(s).toContain("У меня извинился(лась)");
    expect(s).not.toContain("попросили прощения");
    expect(s).toContain("Анна");
    expect(s).toContain("опоздание");
  });

  it("said_to_me female: глагол у третьего лица всё ещё скобочный", () => {
    const s = buildApologyNarrative({ ...base, direction: "said_to_me" }, "female");
    expect(s).toContain("извинился(лась)");
  });

  it("пустые поля дают многоточие как раньше", () => {
    const s = buildApologyNarrative(
      {
        direction: "i_said",
        toWhom: "",
        reason: "",
        reflection: "",
      },
      "male",
    );
    expect(s).toContain("…");
  });
});

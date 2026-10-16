import { describe, expect, it } from "vitest";
import { fact, gain, loss, plainText } from "./rich-text";

describe("rich-text", () => {
  it("plainText spojí segmenty bez značek", () => {
    expect(plainText(["Liší se ", loss("poplatkem"), " u ", fact("VOO"), " a ", gain("SPYL")])).toBe(
      "Liší se poplatkem u VOO a SPYL",
    );
  });
});

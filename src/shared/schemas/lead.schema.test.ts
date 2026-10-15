import { describe, expect, it } from "vitest";
import { emailSchema, leadRequestSchema } from "./lead.schema";

const valid = { email: "jan@example.cz", website: "", variant: "a", utm: {}, quiz: { answer: "ne" }, startedAt: 1 };

describe("emailSchema", () => {
  it("přijme běžné e-maily a sanitizuje je (trim, malá písmena, neviditelné znaky)", () => {
    expect(emailSchema.parse("  Jan.Novak+etf@Example.CZ​ ")).toBe("jan.novak+etf@example.cz");
  });

  it.each([
    "",
    "jan",
    "jan@",
    "@example.cz",
    "jan@example",
    "jan novak@example.cz",
    "jan@exa mple.cz",
    "<script>@example.cz",
    "jan@example.cz<script>alert(1)</script>",
    "jan@example.cz\r\nBcc: x@y.cz",
    "jan\"@example.cz",
    "jan@@example.cz",
    `${"a".repeat(65)}@example.cz`,
    `jan@${"a".repeat(250)}.cz`,
  ])("odmítne neplatný nebo nebezpečný e-mail: %j", (email) => {
    expect(emailSchema.safeParse(email).success).toBe(false);
  });

  it("ne-řetězec odmítne", () => {
    expect(emailSchema.safeParse(42).success).toBe(false);
    expect(emailSchema.safeParse({ email: "jan@example.cz" }).success).toBe(false);
  });
});

describe("leadRequestSchema", () => {
  it("platný požadavek projde beze změny hodnot", () => {
    expect(leadRequestSchema.parse(valid)).toEqual({
      email: "jan@example.cz",
      website: "",
      variant: "a",
      utm: { source: null, medium: null, campaign: null, content: null },
      quiz: { answer: "ne" },
      startedAt: 1,
    });
  });

  it("neplatná vedlejší pole nahradí bezpečným výchozím stavem, lead se neztratí", () => {
    const parsed = leadRequestSchema.parse({
      ...valid,
      variant: "x'; DROP TABLE leads;--",
      utm: { source: "meta", medium: "<img src=x>", campaign: 123, content: "ad_a" },
      quiz: { answer: "možná" },
      startedAt: "včera",
    });
    expect(parsed.variant).toBe("a");
    expect(parsed.utm).toEqual({ source: "meta", medium: null, campaign: null, content: "ad_a" });
    expect(parsed.quiz).toBeNull();
    expect(parsed.startedAt).toBeNull();
  });

  it("UTM delší než 100 znaků se zkrátí, neznámá pole se zahodí", () => {
    const parsed = leadRequestSchema.parse({ ...valid, utm: { source: "a".repeat(500) }, admin: true });
    expect(parsed.utm.source).toHaveLength(100);
    expect(parsed).not.toHaveProperty("admin");
  });

  it("honeypot: ne-řetězec se bere jako vyplněný", () => {
    expect(leadRequestSchema.parse({ ...valid, website: { x: 1 } }).website).not.toBe("");
    expect(leadRequestSchema.parse({ ...valid, website: undefined }).website).toBe("");
  });

  it("chybějící nebo neplatný e-mail → chyba", () => {
    expect(leadRequestSchema.safeParse({ ...valid, email: "x" }).success).toBe(false);
    expect(leadRequestSchema.safeParse({ website: "" }).success).toBe(false);
  });
});

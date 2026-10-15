import { describe, expect, it } from "vitest";
import { umamiConfig, umamiConnectSources, umamiOrigin } from "./umami-config";

const env = {
  NEXT_PUBLIC_UMAMI_WEBSITE_ID: "test-id",
  NEXT_PUBLIC_UMAMI_SCRIPT_URL: "https://analytics.example.com/script.js",
  NEXT_PUBLIC_SITE_URL: "https://etf.example.cz",
};

describe("umamiConfig", () => {
  it("s ID a skriptem vrátí konfiguraci, doménu vezme ze SITE_URL", () => {
    expect(umamiConfig(env)).toEqual({ src: env.NEXT_PUBLIC_UMAMI_SCRIPT_URL, websiteId: "test-id", domains: "etf.example.cz" });
    expect(umamiOrigin(env)).toBe("https://analytics.example.com");
  });

  it("bez ID nebo skriptu je Umami vypnuté", () => {
    expect(umamiConfig({ ...env, NEXT_PUBLIC_UMAMI_WEBSITE_ID: "" })).toBeNull();
    expect(umamiConfig({ ...env, NEXT_PUBLIC_UMAMI_SCRIPT_URL: undefined })).toBeNull();
    expect(umamiOrigin({})).toBeNull();
  });

  it("chybějící nebo neplatná SITE_URL → vypnuté (jinak by se posílal i localhost), neplatný skript → bez originu", () => {
    expect(umamiConfig({ ...env, NEXT_PUBLIC_SITE_URL: "není url" })).toBeNull();
    expect(umamiConfig({ ...env, NEXT_PUBLIC_SITE_URL: undefined })).toBeNull();
    expect(umamiOrigin({ ...env, NEXT_PUBLIC_UMAMI_SCRIPT_URL: "script.js" })).toBeNull();
  });
});

describe("umamiConnectSources", () => {
  it("Umami Cloud: origin skriptu + poddomény umami.is (data jdou na gateway.umami.is)", () => {
    const cloud = { ...env, NEXT_PUBLIC_UMAMI_SCRIPT_URL: "https://cloud.umami.is/script.js" };
    expect(umamiConnectSources(cloud)).toEqual(["https://cloud.umami.is", "https://*.umami.is"]);
  });

  it("vlastní instance: jen origin skriptu; vypnuté Umami: nic", () => {
    expect(umamiConnectSources(env)).toEqual(["https://analytics.example.com"]);
    expect(umamiConnectSources({})).toEqual([]);
  });

  it("podobně pojmenovaná cizí doména nedostane výjimku", () => {
    const fake = { ...env, NEXT_PUBLIC_UMAMI_SCRIPT_URL: "https://evilumami.is/script.js" };
    expect(umamiConnectSources(fake)).toEqual(["https://evilumami.is"]);
  });
});


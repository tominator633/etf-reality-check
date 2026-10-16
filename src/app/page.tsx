import etf from "@data/etf.json";
import { datasetSchema } from "@data/schema";
import { defaultHeroVariant, heroVariants } from "@content/hero-variants";
import { EtfRealityCheck, Hero, buildHeroValues, buildRealityCheckView } from "@/features/etf-reality-check";
import { LeadCapture } from "@/features/lead";
import styles from "./page.module.css";

const view = buildRealityCheckView(datasetSchema.parse(etf));
const heroValues = buildHeroValues(view);

export default function Home() {
  const variant = heroVariants[defaultHeroVariant];

  return (
    <main className={styles.page} data-variant={variant.id}>
      <Hero h1={variant.h1(heroValues)} subtitle={variant.subtitle(heroValues)} />
      {/* Formulář je součástí odhalení: bez srovnání se nezobrazí (Tom). */}
      <EtfRealityCheck
        view={view}
        afterReveal={
          <LeadCapture
            variant={defaultHeroVariant}
            emailEnabled={process.env.EMAIL_ENABLED === "true"}
            privacyHref="/zasady-ochrany-udaju"
          />
        }
      />
    </main>
  );
}

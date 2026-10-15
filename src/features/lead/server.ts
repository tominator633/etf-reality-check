import "server-only";

// Serverové API featury lead (jen pro src/app/api/*). Odděleno od index.ts, aby se
// serverový kód nedostal do klientského bundlu.
export { saveLead } from "./services/save-lead";
export { clientIp, createRateLimiter } from "./services/rate-limit";

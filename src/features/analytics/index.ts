// Veřejné API featury analytics (tech-spec 3).
export { track, trackOnce, type EventName } from "./lib/track";
export { getUtm, type Utm } from "./lib/utm";
export { umamiConfig, umamiOrigin } from "./lib/umami-config";
export { useTrackInView } from "./hooks/use-track-in-view";

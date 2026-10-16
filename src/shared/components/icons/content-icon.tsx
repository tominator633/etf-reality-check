import { DocumentIcon } from "./document-icon";
import { ExchangeIcon } from "./exchange-icon";
import { GlobeIcon } from "./globe-icon";
import type { IconProps } from "./icon";
import { LoopIcon } from "./loop-icon";
import { PercentIcon } from "./percent-icon";
import { SearchIcon } from "./search-icon";
import { ShieldIcon } from "./shield-icon";

// Ikona podle názvu z content/copy.ts (texty říkají, jaká ikona k nim patří; vzhled řeší tady).
export type ContentIconName = "document" | "globe" | "search" | "percent" | "shield" | "loop" | "exchange";

const ICONS: Record<ContentIconName, (props: IconProps) => React.JSX.Element> = {
  document: DocumentIcon,
  globe: GlobeIcon,
  search: SearchIcon,
  percent: PercentIcon,
  shield: ShieldIcon,
  loop: LoopIcon,
  exchange: ExchangeIcon,
};

export function ContentIcon({ name, ...props }: IconProps & { name: ContentIconName }) {
  const Component = ICONS[name];
  return <Component {...props} />;
}

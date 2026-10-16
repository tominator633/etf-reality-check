import { Icon, type IconProps } from "./icon";

export function ExchangeIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M5 8h14" />
      <path d="M16 5l3 3-3 3" />
      <path d="M19 16H5" />
      <path d="M8 13l-3 3 3 3" />
    </Icon>
  );
}

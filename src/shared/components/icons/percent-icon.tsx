import { Icon, type IconProps } from "./icon";

export function PercentIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M19 5L5 19" />
      <circle cx="7" cy="7" r="2.5" />
      <circle cx="17" cy="17" r="2.5" />
    </Icon>
  );
}

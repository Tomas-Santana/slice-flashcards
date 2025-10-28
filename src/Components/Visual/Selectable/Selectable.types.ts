export interface SelectableProps {
  selected: boolean;
  onSelectChange?: (selected: boolean) => void;
  content: HTMLElement;
  class: string;
}

export interface SButtonSelectProps {
  options: Array<{ label: string; value: string }>;
  selectedValue: string;
  singleSelect: boolean;
  onSelect: (value: string) => void;
  label?: string;
}

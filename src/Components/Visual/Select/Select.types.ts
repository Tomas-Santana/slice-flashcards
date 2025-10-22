export interface SelectProps<T = any> {
  options: T[];
  multiple?: boolean;
  onOptionSelect: (value: T | null) => void;
  label?: string;
  disabled?: boolean;
}
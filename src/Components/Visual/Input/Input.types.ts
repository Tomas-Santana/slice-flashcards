export interface InputConditions {
  regex?: RegExp;
  minLength?: number;
  maxLength?: number;
  minMinusc?: number;
  maxMinusc?: number;
  minMayusc?: number;
  maxMayusc?: number;
  minNumber?: number;
  maxNumber?: number;
  minSymbol?: number;
  maxSymbol?: number;
}

export interface InputProps {
  placeholder?: string;
  value?: string;
  type?: 'text' | 'password' | 'email' | 'number' | 'search' | 'tel' | 'url';
  required?: boolean;
  disabled?: boolean;
  secret?: boolean;
  maxLength?: number;
  minLength?: number;
  conditions?: InputConditions;
  onChange?: (value: string) => void;
}


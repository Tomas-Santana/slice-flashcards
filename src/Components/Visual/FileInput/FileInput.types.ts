export interface FileInputProps {
  onFileSelect: (file: File) => void;
  accept?: string;
  multiple?: boolean;
  disabled?: boolean;
}

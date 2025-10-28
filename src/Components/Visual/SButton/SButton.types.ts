export interface SButtonProps {
  content: HTMLElement | string;
  onClick?: () => void | Promise<void>;
  class: string;
  variant: 'primary' | 'outline' | 'secondary' | 'danger' | 'ghost';
  size?: 'icon';
}

export interface SidebarToggleProps {
  /** Accessible label for the toggle button */
  label?: string;
  /** Optional icon passed to the Button component */
  icon?: {
    name: string;
    iconStyle?: string;
    size?: "small" | "medium" | "large";
  };
}

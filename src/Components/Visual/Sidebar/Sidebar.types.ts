export interface SidebarRoute {
  /** Display name for the route button */
  name: string;
  /** Router path to navigate to */
  path: string;
  /** Optional icon to render alongside the name */
  icon?: { name: string; iconStyle?: string };
}

export interface SidebarProps {
  /** Optional header element rendered at the top of the sidebar */
  header?: HTMLElement | null;
  /** Navigation routes rendered as buttons */
  routes: SidebarRoute[];
  /** Optional footer element rendered at the bottom */
  footer?: HTMLElement | null;
  /** Whether the sidebar should start open regardless of breakpoint */
  defaultOpen?: boolean;
}

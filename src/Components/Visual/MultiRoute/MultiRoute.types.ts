import type { ComponentName } from "../../../components.gen";

export type ComponentRoute = {
  path: string;
  component: ComponentName;
};

export interface MultiRouteProps {
  routes: ComponentRoute[];
}

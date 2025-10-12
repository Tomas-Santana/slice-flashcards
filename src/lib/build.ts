// Typed build wrapper around window.slice.build with name/props and return type inference
import type {
  ComponentName,
  ComponentPropsMap,
  ComponentInstanceMap,
} from "../components.gen";

declare global {
  interface Window {
    slice: any;
  }
}

type BuildReturn<C extends ComponentName> = Promise<ComponentInstanceMap[C]>;

export default async function build<C extends ComponentName>(
  name: C,
  props?: Partial<ComponentPropsMap[C]> & { sliceId?: string }
): BuildReturn<C> {
  // Forward to slice.build while preserving types for name/props
  // @ts-ignore - slice injected at runtime
  return window.slice.build(name, props ?? {});
}

import type {
  ComponentName,
  ComponentPropsMap,
  ComponentInstanceMap,
} from "../components.gen";

/**
 * Ambient declarations for the runtime `slice` global.
 * This file provides typing for `window.slice` without editing the runtime implementation.
 */

declare global {
  // Minimal controller shape used at runtime by many components. Keep wide (any) where unsure.
  interface SliceController {
    activeComponents: Map<string, any>;
    classes: Map<string, any>;
    templates: Map<string, HTMLTemplateElement>;
    requestedStyles: Set<string>;
    componentCategories: Map<string, string>;
    fetchText(
      componentName: string,
      type: "html" | "css",
      category?: string
    ): Promise<string | null>;
    setComponentProps(component: any, props: Record<string, any>): void;
    verifyComponentIds(instance: any): boolean;
    registerComponent(instance: any): void;
    registerComponentsRecursively(instance: any): void;
    loadTemplateToComponent(instance: any): void;
  }

  interface SliceStylesManager {
    registerComponentStyles(name: string, css: string): void;
    themeManager: any;
    init(): Promise<void>;
  }

  // The Slice runtime class (lightweight surface of the real implementation)
  class Slice {
    controller: SliceController;
    stylesManager: SliceStylesManager;
    paths: Record<string, any>;
    themeConfig: any;
    stylesConfig: any;
    loggerConfig: any;
    debuggerConfig: any;
    loadingConfig: any;

    constructor(sliceConfig: any);

    /**
     * Dynamically imports a module and returns its default export (class/function/whatever).
     */
    getClass(module: string): Promise<any>;

    isProduction(): boolean;

    getComponent(componentSliceId: string): any;

    /**
     * Build a component by name. Return type is inferred from generated ComponentInstanceMap.
     * Returns null on error.
     */
    build<C extends ComponentName>(
      componentName: C,
      props?: Partial<ComponentPropsMap[C]> & { sliceId?: string }
    ): Promise<ComponentInstanceMap[C] | null>;

    setTheme(themeName: string): Promise<void>;

    readonly theme: any;

    attachTemplate(componentInstance: any): void;
  }

  interface Window {
    slice: Slice;
  }
}

export {};

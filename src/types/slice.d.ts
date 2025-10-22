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
    // Router instance is attached at runtime
    router: Router;

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

  // Minimal, typed surface of the Router used by the app runtime
  // Route info object passed to guards and used internally
  interface RouteInfo {
    path: string;
    component: string;
    params: Record<string, any>;
    query: Record<string, string>;
    metadata: any;
  }

  type NextCallback = (
    arg?: false | string | { path: string; replace?: boolean } | void
  ) => void;
  type BeforeEachGuard = (
    to: RouteInfo,
    from: RouteInfo,
    next: NextCallback
  ) => any | Promise<any>;
  type AfterEachGuard = (to: RouteInfo, from: RouteInfo) => any | Promise<any>;

  interface NavigateOptions {
    replace?: boolean;
  }

  interface Router {
    // public state
    routes: any[];
    activeRoute: any | null;
    pathToRouteMap: Map<string, any>;
    routeContainersCache: Map<string, any>;
    lastCacheUpdate: number;
    CACHE_DURATION: number;
    observer?: MutationObserver;

    // guards
    beforeEach(guard: BeforeEachGuard | null): void;
    afterEach(guard: AfterEachGuard | null): void;

    // lifecycle
    init(): void; // sets up popstate and may auto-start
    start(): Promise<void>; // explicitly start the router

    // internal/utility methods surfaced for runtime usage
    setupMutationObserver(): void;
    invalidateCache(): void;
    createPathToRouteMap(
      routes: any[],
      basePath?: string,
      parentRoute?: any
    ): Map<string, any>;
    renderRoutesComponentsInPage(
      searchContainer?: Document | Element
    ): Promise<boolean>;
    getCachedRouteContainers(container?: Document | Element): any[];
    findAllRouteContainersOptimized(container?: Document | Element): Element[];
    renderRoutesInComponent(component: any): Promise<boolean>;

    // navigation
    onRouteChange(): Promise<void>;
    navigate(
      path: string,
      _redirectChain?: string[],
      _options?: NavigateOptions
    ): Promise<void>;
    handleRoute(route: any, params: Record<string, any>): Promise<void>;
    loadInitialRoute(): Promise<void>;

    // guards/flow helpers
    _createRouteInfo(
      route: any,
      params?: Record<string, any>,
      requestedPath?: string | null
    ): RouteInfo;
    _parseQueryParams(): Record<string, string>;
    _executeBeforeEachGuard(
      to: RouteInfo,
      from: RouteInfo
    ): Promise<{ path?: string; options?: NavigateOptions } | null>;
    _executeAfterEachGuard(to: RouteInfo, from: RouteInfo): void;
    _performNavigation(to: RouteInfo, from: RouteInfo): Promise<void>;

    // route matching
    matchRoute(path: string): {
      route: any | null;
      params: Record<string, any>;
      childRoute?: any;
    };
    compilePathPattern(pattern: string): {
      regex: RegExp;
      paramNames: string[];
    };

    // internal state used by the implementation (exposed for debugging/runtime features)
    _beforeEachGuard?: BeforeEachGuard | null;
    _afterEachGuard?: AfterEachGuard | null;
    _started?: boolean;
    _autoStartTimeout?: any;
    routeChangeTimeout?: any;
  }

  interface Window {
    slice: Slice;
  }
}

export {};

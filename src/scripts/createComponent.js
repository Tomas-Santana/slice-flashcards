#!/usr/bin/env node
// Create a Visual component (TypeScript) with a props interface, plus regenerate components.gen.ts
import fs from "fs";
import path from "path";

const root = path.resolve(process.cwd());
const SRC = path.join(root, "src");
const COMPONENTS_ROOT = path.join(SRC, "Components");
const COMPONENTS_GEN = path.join(SRC, "components.gen.ts");

function isVisualCategory(dirName) {
  return ["Visual", "AppComponents"].includes(dirName);
}

function toClassName(name) {
  if (!name) return "";
  const cleaned = name.replace(/[^a-zA-Z0-9]/g, "");
  return cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
}

function validateName(name) {
  return /^[A-Za-z][A-Za-z0-9]*$/.test(name);
}

function writeFileSafe(filePath, content) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, content, "utf8");
}

function createVisualComponent(componentInputName) {
  if (!validateName(componentInputName)) {
    throw new Error(
      `Invalid component name '${componentInputName}'. Use PascalCase or letters+digits starting with a letter (e.g., Button, NavBar).`
    );
  }

  const className = toClassName(componentInputName);
  const dir = path.join(COMPONENTS_ROOT, "Visual", className);
  if (fs.existsSync(dir)) {
    throw new Error(`Component directory already exists: ${dir}`);
  }

  const lower = className.toLowerCase();
  const tsPath = path.join(dir, `${className}.ts`);
  const typesPath = path.join(dir, `${className}.types.ts`);
  const cssPath = path.join(dir, `${className}.css`);
  const htmlPath = path.join(dir, `${className}.html`);

  const typesContent =
    `export interface ${className}Props {
	// TODO: declare strongly-typed props for ${className}
}

export type ${className}Tag = ` +
    "`slice-" +
    lower +
    "`" +
    `;
`;

  const tsContent = `import type { ${className}Props } from './${className}.types';

export default class ${className} extends HTMLElement {
	static props = {
		// Define your component props here (runtime schema)
	};

	constructor(props?: Partial<${className}Props>) {
		super();
		// @ts-ignore slice is provided by the framework at runtime
		slice.attachTemplate(this);
		// @ts-ignore controller at runtime
		slice.controller.setComponentProps(this, props);
	}

	init() {
		// Component initialization logic (can be async)
	}

	update() {
		// Component update logic (can be async)
	}
}

customElements.define('slice-${lower}', ${className});
`;

  const cssContent = `/* Styles for ${className} component */\n`;
  const htmlContent = `<div class="${lower}">\n  ${className}\n</div>\n`;

  writeFileSafe(typesPath, typesContent);
  writeFileSafe(tsPath, tsContent);
  writeFileSafe(cssPath, cssContent);
  writeFileSafe(htmlPath, htmlContent);

  return { dir, className, tsPath, typesPath };
}

function findMostRecentlyCreatedComponent() {
  // Search Visual and Service folders for a single JS file just created by CLI
  const candidateDirs = [];
  for (const typeDir of ["Visual", "Service", "AppComponents"]) {
    const base = path.join(COMPONENTS_ROOT, typeDir);
    if (!fs.existsSync(base)) continue;
    for (const child of fs.readdirSync(base)) {
      const full = path.join(base, child);
      if (fs.statSync(full).isDirectory()) {
        // component folder expected to contain <Name>.js
        const jsFile = path.join(full, `${child}.js`);
        if (fs.existsSync(jsFile)) {
          candidateDirs.push({
            dir: full,
            jsFile,
            mtime: fs.statSync(jsFile).mtimeMs,
            typeDir,
            name: child,
          });
        }
      }
    }
  }

  if (!candidateDirs.length) return null;
  candidateDirs.sort((a, b) => b.mtime - a.mtime);
  return candidateDirs[0];
}

function ensureTsForComponent(info) {
  const { dir, jsFile, typeDir, name } = info;
  const tsFile = path.join(dir, `${name}.ts`);

  // If already TS, skip rename
  if (!fs.existsSync(tsFile)) {
    // Add minimal TS annotations safely
    let code = fs.readFileSync(jsFile, "utf8");
    // Heuristic: add HTMLElement typing if extends HTMLElement
    if (
      /extends\s+HTMLElement/.test(code) &&
      !/constructor\s*\(props\?/.test(code)
    ) {
      code = code.replace(/constructor\s*\(([^)]*)\)/, (m, args) => {
        const trimmed = (args || "").trim();
        if (!trimmed) return "constructor(props?: any)";
        if (!/props\s*:\s*/.test(trimmed)) return "constructor(props?: any)";
        return `constructor(${trimmed})`;
      });
    }
    fs.writeFileSync(tsFile, code, "utf8");
    // Keep original JS to preserve current runtime until a TS build step is introduced.
  }

  // Create .types.ts with props interface if missing
  const typesFile = path.join(dir, `${name}.types.ts`);
  if (!fs.existsSync(typesFile)) {
    const isVisual = isVisualCategory(typeDir);
    const iface = `export interface ${name}Props {
	// TODO: declare strongly-typed props for ${name}
}

export type ${name}Tag = ${
      isVisual ? "`slice-" + name.toLowerCase() + "`" : "never"
    };
`;
    fs.writeFileSync(typesFile, iface, "utf8");
  }

  // For visual components, also convert css/html import friendliness (no changes needed here)
}

function collectAllComponents() {
  const entries = [];
  for (const typeDir of ["Visual", "Service", "AppComponents"]) {
    const base = path.join(COMPONENTS_ROOT, typeDir);
    if (!fs.existsSync(base)) continue;
    for (const compName of fs.readdirSync(base)) {
      const dir = path.join(base, compName);
      if (!fs.statSync(dir).isDirectory()) continue;
      // Prefer TS over JS
      const tsPath = path.join(dir, `${compName}.ts`);
      const jsPath = path.join(dir, `${compName}.js`);
      const typePath = path.join(dir, `${compName}.types.ts`);
      const exists = fs.existsSync(tsPath) || fs.existsSync(jsPath);
      if (!exists) continue;
      entries.push({
        name: compName,
        typeDir,
        filePath: fs.existsSync(tsPath) ? tsPath : jsPath,
        typesPath: fs.existsSync(typePath) ? typePath : null,
      });
    }
  }
  return entries;
}

function generateComponentsGen(entries) {
  // Build types for name -> props (type-only imports, no runtime imports)
  const lines = [];
  const typeImports = [];
  const nameLits = [];
  const propsMapEntries = [];

  for (const e of entries) {
    const typeRel = e.typesPath
      ? "./" +
        path
          .relative(SRC, e.typesPath)
          .replace(/\\/g, "/")
          .replace(/\.[tj]sx?$/, "")
      : null;
    const importName = e.name;
    if (typeRel)
      typeImports.push(`import type { ${importName}Props } from '${typeRel}';`);
    nameLits.push(`'${e.name}'`);
    propsMapEntries.push(
      `  '${e.name}': ${typeRel ? `${importName}Props` : "any"}`
    );
  }

  lines.push("// AUTO-GENERATED FILE. Do not edit manually.");
  lines.push("// Updated by src/scripts/createComponent.js");
  if (typeImports.length) lines.push(...typeImports);
  lines.push("");
  lines.push(
    `export type ComponentName = ${
      nameLits.length ? nameLits.join(" | ") : "never"
    };`
  );
  lines.push("");
  lines.push("export type ComponentPropsMap = {");
  if (propsMapEntries.length) {
    lines.push(propsMapEntries.join(",\n"));
  }
  lines.push("};");
  lines.push("");
  const content = lines.join("\n");
  // ensure dir
  fs.mkdirSync(path.dirname(COMPONENTS_GEN), { recursive: true });
  fs.writeFileSync(COMPONENTS_GEN, content, "utf8");
}

function main() {
  try {
    const argName = process.argv[2];
    if (argName) {
      // Standalone generation path: create a Visual component in TS directly
      const created = createVisualComponent(argName);
      console.log(`[slice generator] Created TS component at ${created.dir}`);
    } else {
      // Legacy compatibility: if invoked without args, try to convert the most recent JS component to TS
      const comp = findMostRecentlyCreatedComponent();
      if (comp) ensureTsForComponent(comp);
    }

    const all = collectAllComponents();
    generateComponentsGen(all);
    console.log(`[slice generator] Updated ${COMPONENTS_GEN}`);
  } catch (err) {
    console.error("[slice generator] Error:", err);
    process.exitCode = 1;
  }
}

main();

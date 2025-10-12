#!/usr/bin/env node
import fs from "fs";
import path from "path";
import components from "../Components/components.js";

const root = path.resolve(process.cwd());
const SRC = path.join(root, "src");
const COMPONENTS_ROOT = path.join(SRC, "Components");

function toClassName(name) {
  if (!name) return "";
  const cleaned = name.replace(/[^a-zA-Z0-9]/g, "");
  return cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
}

function removeDirRecursive(dir) {
  if (!fs.existsSync(dir)) return;
  for (const entry of fs.readdirSync(dir)) {
    const full = path.join(dir, entry);
    const stat = fs.statSync(full);
    if (stat.isDirectory()) removeDirRecursive(full);
    else fs.unlinkSync(full);
  }
  fs.rmdirSync(dir);
}

function updateComponentsRegistry(name) {
  if (!components[name]) return false;
  delete components[name];
  const lines = [];
  lines.push("const components = {");
  for (const [key, value] of Object.entries(components)) {
    lines.push(`  "${key}": "${value}",`);
  }
  lines.push("};");
  const content = lines.join("\n") + "\nexport default components;\n";
  fs.writeFileSync(
    path.join(COMPONENTS_ROOT, "components.js"),
    content,
    "utf8"
  );
  return true;
}

async function regenerateTypes() {
  // Reuse the generator to refresh components.gen.ts and HTML custom data
  const generator = path.join(SRC, "scripts", "createComponent.js");
  const mod = await import("node:child_process");
  mod.spawnSync("node", [generator], { stdio: "inherit" });
}

async function main() {
  const rawArg = process.argv[2];
  if (!rawArg) {
    console.error("Usage: node src/scripts/deleteComponent.js <ComponentName>");
    process.exit(1);
  }
  const name = toClassName(rawArg);
  const type = components[name];
  if (!type) {
    console.error(`Component '${name}' not found in registry.`);
    process.exit(1);
  }

  const dir = path.join(COMPONENTS_ROOT, type, name);
  if (!fs.existsSync(dir)) {
    console.warn(
      `Directory not found for '${name}' at ${dir}. Continuing to update registry...`
    );
  } else {
    console.log(`Removing component directory: ${dir}`);
    removeDirRecursive(dir);
  }

  updateComponentsRegistry(name);
  console.log("Regenerating component types...");
  await regenerateTypes();
  console.log(`Deleted component '${name}'.`);
}

main().catch((e) => {
  console.error("Delete failed:", e);
  process.exit(1);
});

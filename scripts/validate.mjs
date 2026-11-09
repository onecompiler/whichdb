/**
 * Validate database profiles and logos.
 *
 *   npm run validate                    # everything
 *   npm run validate -- postgresql neon # specific profiles (slugs or paths)
 *   npm run validate -- --strict        # also fail on `alternatives` that point to missing profiles
 *
 * schema/profile.schema.json is generated from the WhichDB site's schema; this script adds the
 * checks JSON Schema cannot express.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import Ajv2020 from "ajv/dist/2020.js";
import addFormats from "ajv-formats";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const DB_DIR = path.join(ROOT, "databases");
const LOGO_DIR = path.join(ROOT, "logos");
const schema = JSON.parse(fs.readFileSync(path.join(ROOT, "schema", "profile.schema.json"), "utf8"));

const args = process.argv.slice(2);
const strict = args.includes("--strict");
const targets = args.filter((a) => !a.startsWith("--"));

const ajv = new Ajv2020({ allErrors: true, strict: false });
addFormats(ajv);
// Match the site's Zod `z.url()`, which parses with WHATWG URL and so accepts e.g. "…/InterSystems_Caché".
ajv.addFormat("uri", {
  validate: (s) => {
    try {
      new URL(s);
      return true;
    } catch {
      return false;
    }
  },
});
const check = ajv.compile(schema);

const allFiles = fs.readdirSync(DB_DIR).filter((f) => f.endsWith(".json")).sort();
const allSlugs = new Set(allFiles.map((f) => f.slice(0, -5)));
const files = targets.length ? targets.map((t) => path.basename(t).replace(/\.json$/, "") + ".json") : allFiles;

let errors = 0;
let warnings = 0;
const fail = (file, msg) => {
  errors++;
  console.error(`✗ ${file}: ${msg}`);
};
const warn = (file, msg) => {
  warnings++;
  console.warn(`⚠ ${file}: ${msg}`);
};

/** Ajv messages, minus the unreadable ones. */
function describe(e) {
  if (e.keyword === "not" && e.instancePath === "/slug") return "is a reserved site path (see schema: slug.not.enum)";
  if (e.keyword === "pattern" && e.params.pattern.length > 40) return "is not a valid date (YYYY-MM-DD)";
  if (e.keyword === "format" && e.params.format === "date") return "is not a valid date (YYYY-MM-DD)";
  if (e.keyword === "enum") return `must be one of: ${e.params.allowedValues.join(", ")}`;
  if (e.keyword === "additionalProperties") return `has an unknown field "${e.params.additionalProperty}"`;
  return e.message;
}

// Names must be unique across the whole dataset, not just the files being checked.
const nameOwner = new Map();
for (const f of allFiles) {
  try {
    const { name } = JSON.parse(fs.readFileSync(path.join(DB_DIR, f), "utf8"));
    if (typeof name !== "string") continue;
    const key = name.toLowerCase();
    if (!nameOwner.has(key)) nameOwner.set(key, []);
    nameOwner.get(key).push(f);
  } catch {
    // reported below when the file is checked
  }
}

for (const file of files) {
  const full = path.join(DB_DIR, file);
  if (!fs.existsSync(full)) {
    fail(file, "not found");
    continue;
  }
  let db;
  try {
    db = JSON.parse(fs.readFileSync(full, "utf8"));
  } catch (e) {
    fail(file, `invalid JSON: ${e.message}`);
    continue;
  }
  if (!check(db)) {
    const msgs = new Set(check.errors.map((e) => `${e.instancePath || "(root)"} ${describe(e)}`));
    for (const m of msgs) fail(file, m);
    continue;
  }
  if (`${db.slug}.json` !== file) fail(file, `slug "${db.slug}" does not match the filename`);
  if (!db.models.includes(db.primaryModel)) fail(file, "models must include primaryModel");
  if (db.alternatives?.includes(db.slug)) fail(file, "alternatives must not include itself");
  const sameName = nameOwner.get(db.name.toLowerCase()) ?? [];
  if (sameName.length > 1) fail(file, `duplicate name "${db.name}" (${sameName.join(", ")})`);
  const dangling = (db.alternatives ?? []).filter((a) => !allSlugs.has(a));
  if (dangling.length) {
    const msg = `alternatives not in the dataset: ${dangling.join(", ")}`;
    if (strict) fail(file, msg);
    else warn(file, msg);
  }
}

// Logos: one 160×160 WebP per profile at most, each with a recorded source.
if (!targets.length) {
  const sources = JSON.parse(fs.readFileSync(path.join(LOGO_DIR, "sources.json"), "utf8"));
  const logos = fs.readdirSync(LOGO_DIR).filter((f) => f !== "sources.json");
  for (const f of logos) {
    const slug = f.replace(/\.webp$/, "");
    if (!f.endsWith(".webp")) fail(`logos/${f}`, "logos must be .webp");
    else if (!allSlugs.has(slug)) fail(`logos/${f}`, `no profile databases/${slug}.json`);
    else if (!sources[slug]) fail(`logos/${f}`, "missing an entry in logos/sources.json");
  }
  for (const slug of Object.keys(sources)) {
    if (!logos.includes(`${slug}.webp`)) fail("logos/sources.json", `"${slug}" has no logos/${slug}.webp`);
  }
}

console.log(`\n${files.length} profile(s) checked · ${errors} error(s) · ${warnings} warning(s)`);
process.exit(errors ? 1 : 0);

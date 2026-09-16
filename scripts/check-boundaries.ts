// Enforces the layer table in CLAUDE.md by parsing source files, so comments and
// string contents can neither trip a rule nor satisfy one.
import ts from 'typescript';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { dirname, join, relative, resolve, sep } from 'node:path';

const ROOT = resolve(import.meta.dirname, '..');
const rel = (p: string): string => relative(ROOT, p).split(sep).join('/');

function walk(dir: string): string[] {
  const abs = join(ROOT, dir);
  let entries: string[];
  try {
    entries = readdirSync(abs);
  } catch {
    return [];
  }
  return entries.flatMap((name) => {
    const full = join(abs, name);
    if (statSync(full).isDirectory()) return walk(rel(full));
    return name.endsWith('.ts') ? [full] : [];
  });
}

type Violation = { file: string; rule: string; detail: string };
const violations: Violation[] = [];
const flag = (file: string, rule: string, detail: string): void => {
  violations.push({ file: rel(file), rule, detail });
};

function specifiers(sf: ts.SourceFile): string[] {
  const out: string[] = [];
  const visit = (node: ts.Node): void => {
    if (
      (ts.isImportDeclaration(node) || ts.isExportDeclaration(node)) &&
      node.moduleSpecifier &&
      ts.isStringLiteral(node.moduleSpecifier)
    ) {
      out.push(node.moduleSpecifier.text);
    }
    if (
      ts.isCallExpression(node) &&
      node.expression.kind === ts.SyntaxKind.ImportKeyword &&
      node.arguments[0] &&
      ts.isStringLiteral(node.arguments[0])
    ) {
      out.push(node.arguments[0].text);
    }
    ts.forEachChild(node, visit);
  };
  visit(sf);
  return out;
}

function hasLogic(sf: ts.SourceFile): string | null {
  let found: string | null = null;
  const visit = (node: ts.Node): void => {
    if (found) return;
    if (
      ts.isFunctionDeclaration(node) ||
      ts.isFunctionExpression(node) ||
      ts.isArrowFunction(node) ||
      ts.isClassDeclaration(node) ||
      ts.isMethodDeclaration(node)
    ) {
      const { line } = sf.getLineAndCharacterOfPosition(node.getStart(sf));
      found = `${ts.SyntaxKind[node.kind]} at line ${line + 1}`;
      return;
    }
    ts.forEachChild(node, visit);
  };
  visit(sf);
  return found;
}

const inside = (target: string, dir: string): boolean =>
  rel(target) === dir || rel(target).startsWith(`${dir}/`);

const TYPE_ONLY_KB = new Set(['src/kb/vocab.ts', 'src/kb/types.ts']);

for (const file of [...walk('src'), ...walk('spec')]) {
  const sf = ts.createSourceFile(file, readFileSync(file, 'utf8'), ts.ScriptTarget.ES2023, true);
  const here = rel(file);

  for (const spec of specifiers(sf)) {
    if (!spec.startsWith('.')) {
      const pinnedLibrary = here.startsWith('src/render/') && spec === 'three';
      if (here.startsWith('src/') && !pinnedLibrary)
        flag(file, 'portable', `non-relative import "${spec}" — only src/render may import "three"`);
      else if (here.startsWith('spec/')) flag(file, 'spec-isolation', `non-relative import "${spec}"`);
      continue;
    }
    const target = resolve(dirname(file), spec);

    if (here.startsWith('src/')) {
      for (const banned of ['spec', 'test', 'scripts']) {
        if (inside(target, banned)) flag(file, 'no-circular-validation', `imports ${rel(target)}`);
      }
    }
    if (here.startsWith('src/kb/') && !inside(target, 'src/kb')) {
      flag(file, 'kb-is-leaf', `imports ${rel(target)}`);
    }
    if (here.startsWith('src/engine/')) {
      if (!inside(target, 'src/kb') && !inside(target, 'src/engine')) {
        flag(file, 'engine-layer', `imports ${rel(target)}`);
      }
      if (rel(target) === 'src/kb/mechanisms.ts' || rel(target) === 'src/kb/render.ts') {
        flag(file, 'engine-ignores-mechanisms', `${rel(target)} explains or draws; it must not drive output`);
      }
    }
    if (here.startsWith('src/geometry/') && !['src/kb', 'src/engine', 'src/geometry'].some((d) => inside(target, d))) {
      flag(file, 'geometry-layer', `imports ${rel(target)} — geometry is pure and may not reach the renderer`);
    }
    if (here.startsWith('spec/') && !inside(target, 'spec') && rel(target) !== 'src/kb/vocab.ts') {
      flag(file, 'spec-isolation', `imports ${rel(target)} — expectations may see only the vocabulary`);
    }
  }

  if (here.startsWith('src/kb/') && !TYPE_ONLY_KB.has(here)) {
    const logic = hasLogic(sf);
    if (logic) flag(file, 'kb-is-data', logic);
  }
}

const pkg = JSON.parse(readFileSync(join(ROOT, 'package.json'), 'utf8')) as {
  dependencies?: Record<string, string>;
};
if (pkg.dependencies && Object.keys(pkg.dependencies).length > 0) {
  violations.push({
    file: 'package.json',
    rule: 'zero-runtime-deps',
    detail: Object.keys(pkg.dependencies).join(', '),
  });
}

if (violations.length > 0) {
  for (const v of violations) console.error(`✗ [${v.rule}] ${v.file}: ${v.detail}`);
  console.error(`\ncheck-boundaries: ${violations.length} violation(s)`);
  process.exit(1);
}
console.log(`check-boundaries: ok (${walk('src').length} src files, ${walk('spec').length} spec files)`);

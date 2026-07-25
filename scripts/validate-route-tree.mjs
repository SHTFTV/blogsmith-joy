#!/usr/bin/env node
/**
 * Prebuild guard for TanStack Router's generated route tree.
 *
 * 1. Ensures src/routeTree.gen.ts exists.
 * 2. Ensures it's newer than any file under src/routes/ (otherwise it's stale).
 * 3. If missing or stale, runs `vite build --mode development` on a scratch
 *    entry so the router-generator plugin regenerates the file.
 * 4. Emits a readable error (with fix commands) when regeneration fails,
 *    distinguishing "crawling result not available" from "routeTree.gen.ts
 *    missing".
 *
 * Env:
 *   ROUTE_TREE_STRICT=1  → do not attempt regeneration, only validate.
 */
import { existsSync, statSync, readdirSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { spawnSync } from 'node:child_process';

const ROOT = resolve(process.cwd());
const TREE = join(ROOT, 'src', 'routeTree.gen.ts');
const ROUTES_DIR = join(ROOT, 'src', 'routes');

function walk(dir) {
  const out = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, entry.name);
    if (entry.isDirectory()) out.push(...walk(p));
    else out.push(p);
  }
  return out;
}

function newestRouteMtime() {
  let newest = 0;
  for (const f of walk(ROUTES_DIR)) {
    const m = statSync(f).mtimeMs;
    if (m > newest) newest = m;
  }
  return newest;
}

function reason() {
  if (!existsSync(TREE)) return 'missing';
  const treeMtime = statSync(TREE).mtimeMs;
  const routesMtime = newestRouteMtime();
  if (routesMtime > treeMtime + 500) return 'stale';
  return null;
}

function fail(kind, extra = '') {
  const banner = '━'.repeat(72);
  const msg =
    kind === 'crawling'
      ? [
          'TanStack Router: "Crawling result not available".',
          '',
          'A route file has an unsupported `createFileRoute(...)` argument.',
          'The generator requires a plain string literal — no `as any`, no',
          'template expressions, no computed values.',
          '',
          'Fix:',
          '  1. Inspect the failing route file printed above.',
          '  2. Replace the argument with a plain string, e.g.',
          "       createFileRoute('/.well-known/identity[.]txt')(...)",
          '  3. Delete src/routeTree.gen.ts and rerun:',
          '       rm -f src/routeTree.gen.ts && bun run build:dev',
        ].join('\n')
      : kind === 'missing'
        ? [
            'src/routeTree.gen.ts is missing and could not be regenerated.',
            '',
            'Fix:',
            '  rm -f src/routeTree.gen.ts',
            '  bun install',
            '  bun run build:dev',
            '',
            'If it still fails, run:',
            '  bun run build:dev 2>&1 | tail -40',
            'and look for "Error transforming route file …" lines.',
          ].join('\n')
        : kind === 'stale'
          ? [
              'src/routeTree.gen.ts is older than files under src/routes/.',
              'Regeneration failed. Delete it and rebuild:',
              '  rm -f src/routeTree.gen.ts && bun run build:dev',
            ].join('\n')
          : `Route tree validation failed: ${kind}`;
  console.error(`\n${banner}\n✗ ${msg}\n${extra ? `\n${extra}\n` : ''}${banner}\n`);
  process.exit(1);
}

function regenerate() {
  console.log('→ routeTree.gen.ts missing/stale; regenerating via vite build --mode development ...');
  const res = spawnSync(
    process.execPath.endsWith('bun') ? 'bun' : 'bunx',
    ['--bun', 'vite', 'build', '--mode', 'development', '--logLevel', 'error'],
    { stdio: 'pipe', encoding: 'utf8', env: { ...process.env, ROUTE_TREE_REGEN_ONLY: '1' } },
  );
  const combined = `${res.stdout || ''}\n${res.stderr || ''}`;
  if (/crawling result not available/i.test(combined) || /expected route id to be a string literal/i.test(combined)) {
    fail('crawling', combined.split('\n').filter(l => /error|route|crawling/i.test(l)).slice(0, 20).join('\n'));
  }
  if (!existsSync(TREE)) {
    fail('missing', combined.split('\n').slice(-30).join('\n'));
  }
  console.log('✓ routeTree.gen.ts regenerated');
}

const state = reason();
if (!state) {
  console.log('✓ routeTree.gen.ts present and up-to-date');
  process.exit(0);
}

if (process.env.ROUTE_TREE_STRICT === '1') {
  fail(state);
}

// Skip nested regeneration attempts if we're already inside one.
if (process.env.ROUTE_TREE_REGEN_ONLY === '1') {
  process.exit(0);
}

regenerate();

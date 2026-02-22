import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const root = path.join(__dirname, '..');
const fixturePath = path.join(root, 'fixtures', 'raw_feature.json');

const input = JSON.parse(fs.readFileSync(fixturePath, 'utf-8'));

const { deriveAll } = await import(path.join(root, 'lib', 'derive.ts'));

const out = deriveAll(input, {
  rcLogisticModel: { beta0: 0, betas: {}, z_clip: 8 },
  roleConfigs: [],
  activeSignalIds: [],
  cohortFriList: [],
});

const must = [
  'rsl.level.short_name',
  'rsl.fri.score',
  'cff.final_type.type_code',
  'rc.control_pattern',
  'rfs.recommended_roles_top3',
];

const get = (obj, dotted) => dotted.split('.').reduce((a, k) => (a ? a[k] : undefined), obj);
const problems = [];
for (const p of must) {
  const v = get(out, p);
  if (v === undefined || v === null) problems.push(`Missing: ${p}`);
}

if (problems.length) {
  console.error('DERIVE TEST FAIL');
  console.error(problems);
  process.exit(1);
}

const outPath = path.join(root, 'artifacts');
fs.mkdirSync(outPath, { recursive: true });
fs.writeFileSync(path.join(outPath, 'output.json'), JSON.stringify(out, null, 2));

console.log('DERIVE TEST OK');
console.log('Wrote artifacts/output.json');

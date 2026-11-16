import path from 'node:path';
import { fileURLToPath } from 'node:url';
import js from '@eslint/js';
import { defineConfig, globalIgnores } from 'eslint/config';
import prettier from 'eslint-config-prettier';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import globals from 'globals';
import tseslint from 'typescript-eslint';

const srcRoot = fileURLToPath(new URL('./src', import.meta.url));

function sourceLocation(filename) {
  const parts = path.relative(srcRoot, filename).split(path.sep);
  if (parts[0] === '..' || path.isAbsolute(parts[0] ?? '')) return undefined;
  return {
    layer: parts[0],
    feature: parts[0] === 'features' ? parts[1] : undefined,
    parts,
  };
}

// Applies to static imports, re-exports, and lazy route imports alike.
const importBoundaries = {
  meta: {
    type: 'problem',
    schema: [],
    messages: {
      shared:
        'Shared modules cannot import app composition or business features.',
      feature: 'Features cannot import app composition.',
      internal:
        'Import another feature through its public entry point (@/features/<name>).',
    },
  },
  create(context) {
    const origin = sourceLocation(context.filename);
    const sharedLayers = new Set([
      'assets',
      'components',
      'config',
      'constants',
      'hooks',
      'lib',
      'services',
      'store',
      'styles',
      'types',
      'utils',
    ]);

    function check(node) {
      const source = node.source;
      if (typeof source?.value !== 'string' || !origin) return;
      const specifier = source.value;
      const targetPath = specifier.startsWith('@/')
        ? path.resolve(srcRoot, specifier.slice(2))
        : specifier.startsWith('.')
          ? path.resolve(path.dirname(context.filename), specifier)
          : undefined;
      if (!targetPath) return;
      const target = sourceLocation(targetPath);
      if (!target) return;

      if (
        sharedLayers.has(origin.layer) &&
        ['app', 'features'].includes(target.layer)
      ) {
        context.report({ node: source, messageId: 'shared' });
      } else if (origin.layer === 'features' && target.layer === 'app') {
        context.report({ node: source, messageId: 'feature' });
      } else if (
        origin.feature &&
        target.feature &&
        origin.feature !== target.feature
      ) {
        const publicEntry =
          target.parts.length === 2 ||
          (target.parts.length === 3 &&
            /^index(?:\.[cm]?[jt]sx?)?$/.test(target.parts[2]));
        if (!publicEntry)
          context.report({ node: source, messageId: 'internal' });
      }
    }

    return {
      ImportDeclaration: check,
      ExportNamedDeclaration: check,
      ExportAllDeclaration: check,
      ImportExpression: check,
    };
  },
};

export default defineConfig([
  globalIgnores(['dist', 'coverage', 'node_modules']),
  {
    files: ['**/*.js'],
    extends: [js.configs.recommended],
    languageOptions: { globals: globals.node },
  },
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommendedTypeChecked,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      globals: { ...globals.browser, ...globals.node },
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    plugins: {
      architecture: { rules: { 'import-boundaries': importBoundaries } },
    },
    rules: {
      '@typescript-eslint/consistent-type-imports': [
        'error',
        { prefer: 'type-imports' },
      ],
      'architecture/import-boundaries': 'error',
    },
  },
  {
    files: ['**/*.test.{ts,tsx}', 'src/test/**'],
    rules: { 'react-refresh/only-export-components': 'off' },
  },
  prettier,
]);

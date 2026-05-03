import { copyFileSync, mkdirSync, readFileSync } from 'node:fs';
import { dirname } from 'node:path';
import { fileURLToPath, URL } from 'node:url';

import vue from '@vitejs/plugin-vue';
import { defineConfig, type Plugin as VitePlugin } from 'vite';
import dts from 'vite-plugin-dts';

const pkg = JSON.parse(
  readFileSync(fileURLToPath(new URL('./package.json', import.meta.url)), 'utf-8')
) as {
  dependencies?: Record<string, string>;
  peerDependencies?: Record<string, string>;
};

/** 构建产物不打包任何 npm 依赖（含子路径），由业务项目自行安装 */
function rootPackageName(id: string): string | null {
  const clean = id.split('?')[0];
  if (!clean || clean.startsWith('.') || clean.startsWith('\0')) return null;
  if (clean.startsWith('@')) {
    const parts = clean.split('/');
    return parts.length >= 2 ? `${parts[0]}/${parts[1]}` : null;
  }
  return clean.split('/')[0] ?? null;
}

const externalPackages = new Set([
  ...Object.keys(pkg.peerDependencies ?? {}),
  ...Object.keys(pkg.dependencies ?? {})
]);

function isDependencyExternal(id: string): boolean {
  const root = rootPackageName(id);
  return root != null && externalPackages.has(root);
}

/** 将指定资源原样复制到 dist（如全局样式、供业务覆写的主题源码） */
function copyBuildAssetsPlugin(): VitePlugin {
  const copies: Array<{ from: URL; to: URL }> = [
    { from: new URL('./src/style.css', import.meta.url), to: new URL('./dist/style.css', import.meta.url) },
  ];
  return {
    name: 'wal-ui-copy-build-assets',
    closeBundle() {
      for (const { from: fromUrl, to: toUrl } of copies) {
        const from = fileURLToPath(fromUrl);
        const to = fileURLToPath(toUrl);
        mkdirSync(dirname(to), { recursive: true });
        copyFileSync(from, to);
      }
    }
  };
}

export default defineConfig({
  plugins: [
    vue(),
    copyBuildAssetsPlugin(),
    dts({
      insertTypesEntry: true,
      include: ['src/**/*.ts', 'src/**/*.vue'],
      tsconfigPath: './tsconfig.build.json'
    })
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  build: {
    lib: {
      entry: fileURLToPath(new URL('./src/index.ts', import.meta.url)),
      name: 'WalUi',
      formats: ['es', 'cjs'],
      fileName: format => (format === 'es' ? 'index.js' : 'index.cjs')
    },
    rollupOptions: {
      external: id => isDependencyExternal(id),
      output: {
        exports: 'named',
        assetFileNames: 'components[extname]'
      }
    },
    sourcemap: true
  }
});

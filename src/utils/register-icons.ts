import type { IconifyIcon } from '@iconify/types';
import { addIcon } from '@iconify/vue';

/**
 * 将已通过 `import.meta.glob` 预加载的图标模块注册到 Iconify，供 `@iconify/vue` 使用 `ri:` 前缀引用。
 *
 * 约定：模块路径以 `*-line.js` 结尾（Remix Icon line 变体）；取文件名去掉 `.js` 作为短名，注册为 `ri:<短名>`。
 * 调用方应在应用挂载前执行一次（例如 `main.ts` 中在 `createApp` 之前），保证菜单等处的 `ri:xxx-line` 在首次渲染前已可用。
 *
 * @param iconModules — `import.meta.glob<{ default: any }>('../node_modules/@iconify-icons/ri/*-line.js', { eager: true })` 的返回值，值为 `{ default: IconifyIcon }`
 */
export function registerIcons(iconModules: Record<string, { default: IconifyIcon }>) {
  for (const [modulePath, moduleValue] of Object.entries(iconModules)) {
    const fileName = modulePath.split('/').pop();
    if (!fileName || !fileName.endsWith('.js')) continue;

    const iconName = fileName.slice(0, -3);
    addIcon(`ri:${iconName}`, moduleValue.default);
  }
}

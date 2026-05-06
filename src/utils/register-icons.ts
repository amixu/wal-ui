import type { IconifyIcon } from '@iconify/types';
import { addIcon } from '@iconify/vue';

/**
 * 在应用启动时批量注册 Remix Icon 的 **line** 变体，供 `@iconify/vue` / `ri:` 前缀使用。
 *
 * 行为说明：
 * - 通过 `import.meta.glob` 同步（`eager: true`）引入 `@iconify-icons/ri` 下所有 `*-line.js` 图标数据，避免运行时按需再拉取
 * - 对每个模块：取文件名（去掉 `.js`）作为图标短名，调用 `addIcon('ri:<短名>', data)` 注册到 Iconify
 *
 * 使用侧：菜单等处的 `style` / 图标名形如 `ri:xxx-line` 时，需在本函数执行之后渲染（通常在 `main.ts` 最先调用）。
 */
export function registerIcons() {
  const riLineIconModules = import.meta.glob<{ default: IconifyIcon }>(
    '../../node_modules/@iconify-icons/ri/*-line.js',
    {
      eager: true
    }
  );

  for (const [modulePath, moduleValue] of Object.entries(riLineIconModules)) {
    const fileName = modulePath.split('/').pop();
    if (!fileName || !fileName.endsWith('.js')) continue;

    const iconName = fileName.slice(0, -3);
    addIcon(`ri:${iconName}`, moduleValue.default);
  }
}

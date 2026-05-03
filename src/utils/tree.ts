import type { VNode } from 'vue';
import { renderIcon } from './render';

export type MenuNodeType = {
  key: string;
  label: string;
  icon?: () => VNode;
  children?: MenuNodeType[];
};

export type MenuItemType = {
  parentCode: string;
  code: string;
  url: string;
  name: string;
  style: string;
  [key: string]: unknown;
};

/**
 * 将扁平菜单列表转换为树形菜单结构。
 *
 * 主要职责：
 * - 按 `code/parentCode` 关系构建父子层级
 * - 根据 `keyValueType` 统一生成节点 `key`
 * - 处理“子节点先于父节点出现”的场景，保证最终树结构完整
 *
 * 参数说明：
 * - `menuList`：菜单扁平列表；每项需包含 `code` 与 `parentCode`
 * - `parentCode`：根节点父标识，默认 `'-1'`
 * - `keyValueType`：节点 key 策略
 *   - `'code'`：`key = item.code`
 *   - `'url'` 或不传：优先 `item.url`（匹配 `/\/\w+/`），否则回退 `item.code`
 *
 * 返回值：
 * - `MenuNodeType[]`：根节点数组形式的树形菜单
 */
export function menuListToTree(
  menuList: MenuItemType[],
  parentCode = '-1',
  keyValueType?: 'url' | 'code'
): MenuNodeType[] {
  const nodeMap = new Map<string, MenuNodeType>();
  const childrenMap = new Map<string, MenuNodeType[]>();
  const roots: MenuNodeType[] = [];

  for (const item of menuList) {
    const key = keyValueType === 'code' ? item.code : /\/\w+/.test(item.url) ? item.url : item.code;
    const currentNode: MenuNodeType = {
      key,
      label: item.name,
      icon: item.style?.startsWith('ri:') ? renderIcon(item.style) : undefined
    };

    nodeMap.set(item.code, currentNode);
  }

  for (const item of menuList) {
    const currentNode = nodeMap.get(item.code);
    if (!currentNode) continue;

    const childNodes = childrenMap.get(item.code);
    if (childNodes?.length) {
      currentNode.children = childNodes;
    }

    if (item.parentCode === parentCode) {
      roots.push(currentNode);
      continue;
    }

    const parentNode = nodeMap.get(item.parentCode);
    if (parentNode) {
      if (!parentNode.children) {
        parentNode.children = [];
      }
      parentNode.children.push(currentNode);
      continue;
    }

    const pendingChildren = childrenMap.get(item.parentCode) ?? [];
    pendingChildren.push(currentNode);
    childrenMap.set(item.parentCode, pendingChildren);
  }

  return roots;
}

/**
 * 从菜单树中获取第一个可用菜单项的 `key`。
 *
 * 主要职责：
 * - 以深度优先顺序遍历菜单树
 * - 优先返回最左侧叶子节点的 `key`
 * - 当树为空或不存在可用节点时返回 `undefined`
 *
 * 参数说明：
 * - `options`：菜单树节点数组（通常为根节点列表）
 *
 * 返回值：
 * - `string | undefined`：命中时返回首个叶子节点 `key`，否则返回 `undefined`
 */
export function getFirstMenuKey(options: MenuNodeType[]): string | undefined {
  for (const item of options) {
    if (item.children?.length) {
      const firstChildPath = getFirstMenuKey(item.children);
      if (firstChildPath) return firstChildPath;
    } else if (item.key) {
      return item.key;
    }
  }
  return undefined;
}

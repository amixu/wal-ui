import type { MenuNodeType } from '../utils';

export function normalizeHashPath(hash: string) {
  const raw = decodeURIComponent((hash || '').replace(/^#/, '').trim());
  if (!raw) return '';
  const pathOnly = raw.split('?')[0] || '';
  if (!pathOnly) return '';
  return pathOnly.startsWith('/') ? pathOnly : `/${pathOnly}`;
}

export function collectMenuKeys(nodes: MenuNodeType[]): Set<string> {
  const keys = new Set<string>();
  const walk = (items: MenuNodeType[]) => {
    for (const item of items) {
      keys.add(String(item.key));
      if (item.children?.length) walk(item.children);
    }
  };
  walk(nodes);
  return keys;
}

export function findMenuLabelChain(
  nodes: MenuNodeType[],
  targetPath: string,
  parentLabels: string[] = []
): string[] | null {
  for (const node of nodes) {
    const nextLabels = [...parentLabels, node.label];
    if (node.key === targetPath) return nextLabels;
    if (node.children?.length) {
      const matched = findMenuLabelChain(node.children, targetPath, nextLabels);
      if (matched) return matched;
    }
  }
  return null;
}

export function resolveActiveMenuPath(
  menuOptions: MenuNodeType[],
  routePath: string,
  routeHash: string
) {
  const menuKeys = collectMenuKeys(menuOptions);
  if (menuKeys.has(routePath)) return routePath;
  const hashPath = normalizeHashPath(routeHash);
  return menuKeys.has(hashPath) ? hashPath : '';
}

export function findAncestorKeys(
  nodes: MenuNodeType[],
  targetKey: string,
  trail: string[] = []
): string[] {
  for (const node of nodes) {
    const currentKey = String(node.key);
    if (currentKey === targetKey) return trail;
    if (node.children?.length) {
      const result = findAncestorKeys(node.children, targetKey, [...trail, currentKey]);
      if (result.length) return result;
    }
  }
  return [];
}

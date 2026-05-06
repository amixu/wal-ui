import { decrypt } from './crypto';
import type { MenuItemType } from './tree';

type RoleAuthority = {
  roleCode: string;
  roleName: string;
  resources?: MenuItemType[];
};

/** 用户中心权限载荷（与 `authDataToUsableData` 读取路径一致的可选嵌套结构） */
type UserAuthorityAuthData = {
  appAuthorities?: Array<{ roleAuthorities?: RoleAuthority[] }>;
  scopeMap?: Record<string, string[]>;
};

/**
 * 应用启动时初始化会话上下文：写入 `appId`，并在 URL 带 `code` 时落库解密后的 token。
 *
 * - `appId` 取值顺序：`workbenAppId`（查询参数）→ 入参 `appId` → `import.meta.env.VITE_APP_ID`
 * - `sessionStorage.appId`：供后续接口与用户态读取
 * - 若存在查询参数 `code`：经 `decrypt` 后写入 `localStorage.token_<appId>`（单应用多 token 隔离）
 *
 * @param appId 可选默认应用标识；未传且 URL 无 `workbenAppId` 时使用构建环境变量
 */
export function initApp(appId?: string) {
  const { workbenAppId, code } = getUrlSearchParams();
  const curAppId = workbenAppId || appId || import.meta.env?.VITE_APP_ID;
  sessionStorage.setItem('appId', curAppId);
  if (code) localStorage.setItem(`token_${curAppId}`, decrypt(code));
}

/**
 * 解析当前页 `location.href` 的查询串，返回「参数名 → 值」对象。
 *
 * - 同名参数多次出现时，保留最后一次出现的值。
 * - `href` 无法解析时返回空对象，不抛错。
 *
 * @returns 查询参数键值对（值为字符串）
 */
export function getUrlSearchParams(): Record<string, string> {
  const href = location?.href || '';
  const out: Record<string, string> = {};
  try {
    const { searchParams } = new URL(href);
    for (const [key, value] of searchParams) {
      out[key] = value;
    }
  } catch {
    // href 非法时返回空对象
  }
  return out;
}

/**
 * 将用户中心返回的权限/角色数据整理为前端可直接使用的结构。
 *
 * 数据来源：取 `authData.appAuthorities[0].roleAuthorities`（缺省时按空数组处理）。
 *
 * 主要职责：
 * - 汇总各角色下的资源，仅保留 `status === 1` 的项，并按 `id` 去重（跨角色合并）
 * - 若资源 `url` 以外链 `http` 开头：写入 `iframeUrl` 为原地址，并将 `url` 规范为 `/iframe/<code>` 供内嵌路由使用
 * - 收集全部角色 `roleCode`、`roleName` 列表
 * - `menuList` 为 `type === 1` 的菜单子集（其余类型如按钮、权限组等仍在 `resources` 中）
 *
 * @param authData 后端权限载荷（含 `appAuthorities`、`scopeMap` 等字段）
 * @returns `resources` 去重后的全量资源、`menuList` 菜单列表、`roleCodes` / `roleNames`、`scopeMap` 维度映射
 */
export function authDataToUsableData(authData: UserAuthorityAuthData | undefined | null) {
  const roleAuthorities = authData?.appAuthorities?.[0]?.roleAuthorities ?? [];
  const realResources: MenuItemType[] = [];
  const roleCodeList: string[] = [];
  const roleNameList: string[] = [];
  roleAuthorities.forEach((role: RoleAuthority) => {
    roleCodeList.push(role.roleCode);
    roleNameList.push(role.roleName);
    role.resources?.forEach(source => {
      if (source.status === 1 && realResources.findIndex(real => real.id === source.id) === -1) {
        if (source?.url.startsWith('http')) {
          source['iframeUrl'] = source.url;
          source.url = `/iframe/${source.code}`;
        }
        realResources.push(source);
      }
    });
  });
  return {
    resources: realResources, // 去重后的所有资源列表（包含菜单，按钮，权限组等）
    menuList: realResources.filter(item => item.type === 1), // 菜单列表
    roleCodes: roleCodeList, // 角色code
    roleNames: roleNameList, // 角色名
    scopeMap: authData?.scopeMap // 维度数据
  };
}

export type EnvKeyType = 'dev' | 'qa' | 'uat' | 'qacanary' | 'canary' | 'prod';
export type DomainKeyType = 'inner' | 'outer';

const DOMAIN_KEYS = ['inner', 'outer'];
const ENV_KEYS = ['dev', 'qa', 'uat', 'qacanary', 'canary', 'prod'];

function isDomainKey(value: unknown): value is DomainKeyType {
  return typeof value === 'string' && (DOMAIN_KEYS as readonly string[]).includes(value);
}

function isEnvKey(value: unknown): value is EnvKeyType {
  return typeof value === 'string' && (ENV_KEYS as readonly string[]).includes(value);
}

export type ObjectType = {
  [key: string]: string;
};

export type EnvType = {
  qa: ObjectType;
  dev?: ObjectType;
  uat?: ObjectType;
  qacanary?: ObjectType;
  canary?: ObjectType;
  prod: ObjectType;
};

export type DomainEnvType = {
  inner: EnvType;
  outer?: EnvType;
};

/**
 * 根据当前页面 URL（`hostname`/`pathname`）推断域类型与运行环境。
 *
 * 主要职责：
 * - 识别当前请求域（`inner`/`outer`）
 * - 根据路径与域名特征推断环境（`dev/qa/uat/qacanary/canary/prod`）
 * - 为本地开发场景提供基于 `VITE_DOMAIN_TYPE/VITE_ENV_TYPE` 的覆盖能力
 *
 * 参数说明：
 * - 无显式参数；函数直接读取 `window.location` 与 `import.meta.env`
 *
 * 返回值：
 * - `[DomainKeyType, EnvKeyType]`：二元组 `[domainKey, envKey]`
 *
 * 注意事项：
 * - 推断规则按优先级执行：本地开发 -> 外网域 -> qacanary 特例 -> 常规环境 -> prod 兜底
 * - 当路径或域名无法匹配到候选环境时，会回退为 `prod`
 */
export function getEnvByWebUrl(): [DomainKeyType, EnvKeyType] {
  const hostname = window.location?.hostname ?? '';
  const pathname = window.location?.pathname ?? '';
  const localDomain = import.meta.env?.VITE_DOMAIN_TYPE;
  const localEnv = import.meta.env?.VITE_ENV_TYPE;
  let domainKey: DomainKeyType =
    hostname.includes('localhost') && isDomainKey(localDomain) ? localDomain : 'inner';
  if (hostname.includes('walmartmobile')) domainKey = 'outer';

  const keys: EnvKeyType[] = ['dev', 'qa', 'uat', 'qacanary', 'canary'];
  if (hostname.includes('localhost')) return [domainKey, isEnvKey(localEnv) ? localEnv : 'qa'];
  for (let i = 0; i < keys.length; i++) {
    const key = keys[i];
    if (key === 'qacanary' && pathname.includes('-canary/') && /-qa\.|\.qa\./.test(hostname)) {
      return [domainKey, key];
    }
    if (pathname.includes(`-${key}/`) || /-qa\.|\.qa\./.test(hostname)) {
      return [domainKey, key];
    }
  }
  return [domainKey, 'prod'];
}

export type EnvKeyType = 'dev' | 'qa' | 'uat' | 'prod';
export type DomainKeyType = 'inner' | 'outer';

const DOMAIN_KEYS = ['inner', 'outer'];
const ENV_KEYS = ['dev', 'qa', 'uat', 'prod'];

function isDomainKey(value: unknown): value is DomainKeyType {
  return typeof value === 'string' && (DOMAIN_KEYS as readonly string[]).includes(value);
}

function isEnvKey(value: unknown): value is EnvKeyType {
  return typeof value === 'string' && (ENV_KEYS as readonly string[]).includes(value);
}

export type EnvType = {
  qa: Record<string, string>;
  dev?: Record<string, string>;
  uat?: Record<string, string>;
  prod: Record<string, string>;
};

export type DomainEnvType = {
  inner: EnvType;
  outer?: EnvType;
};

/** 各运行环境对应的认证与项目站点根 URL，供登录跳转与接口基址使用。 */
export const baseUrlOption: DomainEnvType = {
  inner: {
    dev: {
      loginUrl: 'https://flysky-qa.cn.wal-mart.com/portal/#/login',
      authUrl: 'https://aloha-qa.cn.wal-mart.com',
      projUrl: 'https://aloha-dev.cn.wal-mart.com'
    },
    qa: {
      loginUrl: 'https://flysky-qa.cn.wal-mart.com/portal/#/login',
      authUrl: 'https://aloha-qa.cn.wal-mart.com',
      projUrl: 'https://aloha-qa.cn.wal-mart.com'
    },
    uat: {
      loginUrl: 'https://flysky-qa.cn.wal-mart.com/portal/#/login',
      authUrl: 'https://aloha-qa.cn.wal-mart.com',
      projUrl: 'https://aloha-uat.cn.wal-mart.com'
    },
    prod: {
      loginUrl: 'https://flysky.cn.wal-mart.com/portal/#/login',
      authUrl: 'https://aloha.cn.wal-mart.com',
      projUrl: 'https://aloha.cn.wal-mart.com'
    }
  },
  outer: {
    dev: {
      loginUrl: 'https://flysky-qa.walmartmobile.cn/portal/#/login',
      authUrl: 'https://aloha-qa.walmartmobile.cn',
      projUrl: 'https://aloha-dev.walmartmobile.cn'
    },
    qa: {
      loginUrl: 'https://flysky-qa.walmartmobile.cn/portal/#/login',
      authUrl: 'https://aloha-qa.walmartmobile.cn',
      projUrl: 'https://aloha-qa.walmartmobile.cn'
    },
    uat: {
      loginUrl: 'https://flysky-qa.walmartmobile.cn/portal/#/login',
      authUrl: 'https://aloha-qa.walmartmobile.cn',
      projUrl: 'https://aloha-uat.walmartmobile.cn'
    },
    prod: {
      loginUrl: 'https://flysky.walmartmobile.cn/portal/#/login',
      authUrl: 'https://aloha.walmartmobile.cn',
      projUrl: 'https://aloha.walmartmobile.cn'
    }
  }
};

/**
 * 根据当前页面 URL（`hostname`/`pathname`）推断域类型与运行环境。
 *
 * 主要职责：
 * - 识别当前请求域（`inner`/`outer`）
 * - 根据路径与域名特征推断环境（`dev/qa/uat/prod`）
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

  const keys: EnvKeyType[] = ['dev', 'qa', 'uat'];
  if (hostname.includes('localhost')) return [domainKey, isEnvKey(localEnv) ? localEnv : 'qa'];
  for (let i = 0; i < keys.length; i++) {
    const key = keys[i];
    if (pathname.includes(`-${key}/`) || /-qa\.|\.qa\./.test(hostname)) {
      return [domainKey, key];
    }
  }
  return [domainKey, 'prod'];
}

/**
 * 取得当前域与环境下的接口基址配置（与 `getEnvByWebUrl` 推断结果对应的一行配置）。
 *
 * 主要职责：
 * - 调用 `getEnvByWebUrl()` 得到 `[domainKey, envKey]`（内网/外网 × dev/qa/uat/prod）
 * - 在 `baseUrlOption` 中取出该组合下的 `loginUrl`、`authUrl`、`projUrl` 等字段
 */

export const curEnvData = (function () {
  const [domainKey, envKey] = getEnvByWebUrl();
  return baseUrlOption[domainKey]?.[envKey];
})();

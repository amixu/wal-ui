import axios, {
  type AxiosError,
  type AxiosRequestConfig,
  type AxiosResponse,
  type InternalAxiosRequestConfig,
  type Method
} from 'axios';
import { encode } from 'js-base64';
import type { MessageApi } from 'naive-ui';
import { createDiscreteApi } from 'naive-ui';
import { curEnvData } from './env';
import { naiveUiThemeOverrides } from './naive-ui-skin';

const service = axios.create({
  timeout: 10000
});

service.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  return config;
});

service.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error: unknown) => Promise.reject(error)
);

class HttpError<TData = unknown> extends Error {
  name = 'HttpError' as const;
  status?: number;
  url?: string;
  method?: string;
  data?: TData;
  code?: string | number;
  isNetworkError: boolean;

  constructor(message: string, init?: Partial<HttpError<TData>>) {
    super(message);
    // Ensure correct prototype chain across transpilation targets.
    Object.setPrototypeOf(this, new.target.prototype);
    this.status = init?.status;
    this.url = init?.url;
    this.method = init?.method;
    this.data = init?.data;
    this.code = init?.code;
    this.isNetworkError = init?.isNetworkError ?? false;
  }
}

type Primitive = string | number | boolean | null | undefined;
type AnyObject = Record<string, unknown>;

/** httpRequest 请求选项类型 */
export type RequestType<TQuery extends AnyObject = AnyObject, TBody = unknown> = {
  url: string;
  baseURL?: string;
  method?: Method;
  data?: TBody;
  params?: TQuery;
  headers?: Record<string, string>;
  timeout?: number;
  axios?: Omit<AxiosRequestConfig, 'url' | 'method' | 'params' | 'data' | 'headers' | 'timeout'>;
  //请求在业务上成功（`code === 0`）时弹出提示
  successMessage?: boolean | string;
  // 请求失败（网络异常、HTTP 错误，或业务 `code !== 0` 且非登录跳转）时弹出提示
  errorMessage?: boolean | string;
};

/**
 * httpRequest 后端响应格式类型
 */

export type ResponseType<TResult = unknown> = {
  code: string | number;
  result: TResult;
  message?: string;
};

function isPlainObject(value: unknown): value is AnyObject {
  if (value === null || typeof value !== 'object') return false;
  const proto = Object.getPrototypeOf(value);
  return proto === Object.prototype || proto === null;
}

function stripNil<T extends AnyObject>(obj: T): Partial<T> {
  const out: AnyObject = {};
  for (const [k, v] of Object.entries(obj)) {
    if (v === undefined || v === null) continue;
    out[k] = v;
  }
  return out as Partial<T>;
}

function hasHeader(headers: Record<string, string>, name: string): boolean {
  const lower = name.toLowerCase();
  return Object.keys(headers).some(k => k.toLowerCase() === lower);
}

// function getUUID(): string {
//   return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
//     const r = (Math.random() * 16) | 0;
//     const v = c === 'x' ? r : (r & 0x3) | 0x8;
//     return v.toString(16);
//   });
// }

// function getClientInfo() {
//   return {
//     logId: getUUID()
//   };
// }

let discreteMessageApi: MessageApi | null = null;

function getDiscreteMessage(): MessageApi {
  if (!discreteMessageApi) {
    discreteMessageApi = createDiscreteApi(['message'], {
      configProviderProps: { themeOverrides: naiveUiThemeOverrides }
    }).message;
  }
  return discreteMessageApi;
}

function resolveToastContent(
  flag: boolean | string | undefined,
  responseMessage: string | undefined,
  fallbackWhenTrue?: string
): string | undefined {
  if (flag === undefined || flag === false) return undefined;
  if (typeof flag === 'string') return flag;
  const fromResponse = responseMessage?.trim();
  if (fromResponse) return fromResponse;
  return fallbackWhenTrue?.trim() || undefined;
}

function showToastSuccess(content: string | undefined) {
  if (!content) return;
  getDiscreteMessage().success(content);
}

function showToastError(content: string | undefined) {
  if (!content) return;
  getDiscreteMessage().error(content);
}

/**
 * 拼接统一认证门户的登录页地址，并在查询参数中带回登录成功后的回跳信息。
 *
 * 主要职责：
 * - 解析登录门户基址：取当前环境配置中的 `curEnvData?.loginUrl`
 * - 用当前页面 `location.href` 构造回跳地址，并附加 `appId`（`VITE_APP_ID`），供门户识别应用
 * - 将回跳 URL 先做 Base64（`encode`），再经 `encodeURIComponent` 作为 `target` 查询参数附加到登录地址后
 *
 * 参数说明：
 * - `loginUrl`：可选；显式指定门户登录页基址（通常带 `/#/login` 等路径），不传则走环境配置
 *
 * 返回值：
 * - 完整登录 URL，形如：`{门户}?target={编码后的回跳信息}`
 *
 * 注意事项：
 * - 若既未传入 `loginUrl`、环境配置中又缺少 `loginUrl`，拼接结果中的基址可能异常，调用方应保证环境或入参有效
 */
export function getLoginUrl(): string {
  const curUrl = location.href;
  const targetUrl =
    curUrl + (curUrl.includes('?') ? '&' : '?') + 'appId=' + sessionStorage.getItem('appId');
  return `${curEnvData?.loginUrl}?target=${encodeURIComponent(encode(targetUrl))}`;
}

/**
 * 基于内部 axios 实例发起请求并返回响应数据。
 *
 * 主要职责：
 * - 透传 axios 请求配置到统一实例 `service`
 * - 屏蔽 axios 响应壳层，直接返回 `response.data`
 *
 * 参数说明：
 * - `config`：axios 请求配置对象
 *
 * 返回值：
 * - `Promise<T>`：服务端返回的 `data` 字段
 *
 * 异常：
 * - 透传 `service.request` 抛出的异常（通常为 axios 错误）
 */
export async function request<T>(config: AxiosRequestConfig): Promise<T> {
  const response = await service.request<T>(config);
  return response.data;
}

/**
 * 统一的 HTTP 请求入口（基于 axios 实例）。
 *
 * 主要职责：
 * - 组装请求（method/baseURL/query/body/headers/timeout）
 * - 适配后端约定的请求结构：`{ appName, format, params }`
 * - 规范化响应：仅在 `code === 0` 或 `'0'` 时返回 `result`
 * - 将异常统一包装为 `HttpError`，便于上层集中处理
 *
 * 参数说明：
 * - `options.url`：请求路径（必填）
 * - `options.baseURL`：可选基础地址；未传时按当前环境自动推断
 * - `options.method`：HTTP 方法，默认 `POST`
 * - `options.query`：查询参数；会自动移除 `null/undefined`
 * - `options.body`：请求体
 *   - GET/HEAD：若为 plain object，会合并到 query
 *   - 其他方法：作为业务参数写入 `data.params`（plain object 同样会剔除空值）
 * - `options.headers`：自定义请求头；若存在请求体且未显式传 `Content-Type`，默认补充 JSON 类型
 * - `options.timeout`：请求超时（毫秒）
 * - `options.successMessage` / `options.errorMessage`：`boolean | string`；`string` 为固定提示；`true` 使用响应体 `message`（错误场景无 `message` 时用解析出的错误文案）；不传或 `false` 不弹出
 * - `options.axios`：额外 axios 配置（不允许覆盖核心字段：`url/method/params/data/headers/timeout`）
 *
 * 返回值：
 * - `Promise<T>`：后端成功时返回 `payload.result`
 *
 * 异常：
 * - 统一抛出 `HttpError`（包含 `status/url/method/data/code/isNetworkError` 等上下文）
 */
export async function httpRequest<T, TQuery extends AnyObject = AnyObject, TBody = unknown>(
  options: RequestType<TQuery, TBody>
): Promise<T> {
  const { successMessage, errorMessage = true } = options;
  const method = (options.method ?? 'POST').toUpperCase() as Method;
  const headers: Record<string, string> = {
    Accept: 'application/json',
    'X-Requested-With': 'XMLHttpRequest',
    ...(options.headers ?? {})
  };

  const url = options.url;
  const query = options.params ? stripNil(options.params) : undefined;
  let baseURL = options.baseURL ?? curEnvData?.projUrl;
  if (url.indexOf('/mock/') === 0) baseURL = '';
  else if (url.indexOf('/user-center/') === 0) baseURL = curEnvData?.authUrl;

  // 部分网关/代理不接受 GET body，这里统一转为 query。
  const isGetLike = method === 'GET' || method === 'HEAD';
  const data = (() => {
    if (isGetLike || options.data === undefined) return undefined;
    // 仅对 plain object 做空值清理；FormData/Blob/Array 等保持原样。
    if (isPlainObject(options.data)) return stripNil(options.data);
    return options.data as Primitive;
  })();

  const params =
    isGetLike && isPlainObject(options.data)
      ? { ...stripNil(options.data), ...(query ?? {}) }
      : query;

  if (data !== undefined && !hasHeader(headers, 'Content-Type')) {
    headers['Content-Type'] = 'application/json; charset=utf-8';
    // headers['ClientInfo'] = encode(JSON.stringify(getClientInfo()));
    headers['Authorization'] = JSON.stringify({
      token: localStorage.getItem(`token_${sessionStorage.getItem('appId')}`)
    });
  }

  try {
    const resp = await service.request<ResponseType<T>>({
      url,
      method,
      baseURL,
      params,
      data: {
        appName: import.meta.env?.VITE_APP_NAME,
        format: 'json',
        params: data
      },
      headers,
      timeout: options.timeout,
      ...(options.axios ?? {})
    });
    const payload = resp.data;

    if (payload.code === '0' || payload.code === 0) {
      showToastSuccess(resolveToastContent(successMessage, payload.message, undefined));
      return payload.result;
    }

    const errorCodeList = ['4001', '-2', '-401', '-402', '-950'];
    // 未登录
    if (errorCodeList.includes(payload.code + '') || url === '/user-center/getUserByToken') {
      location.href = getLoginUrl();
      return null as T;
    }

    showToastError(resolveToastContent(errorMessage, payload.message, '接口异常'));
    return Promise.reject(payload);
  } catch (e) {
    if (!axios.isAxiosError(e)) {
      if (e instanceof HttpError) throw e;
      const message = e instanceof Error ? e.message : 'Request failed';
      showToastError(resolveToastContent(!!errorMessage, message));
      return Promise.reject({ url, method, message });
    }

    const err = e as AxiosError;
    const status = err.response?.status;
    const responseData = err.response?.data as unknown;
    const responseMsg =
      typeof responseData === 'object' && responseData && 'message' in (responseData as AnyObject)
        ? String((responseData as AnyObject).message)
        : undefined;
    const message =
      (typeof responseData === 'string' ? responseData : responseMsg) ||
      err.message ||
      'Request failed';
    showToastError(resolveToastContent(!!errorMessage, message, responseMsg));
    return Promise.reject({ url, method, status, message });
  }
}

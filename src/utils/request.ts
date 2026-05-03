import axios, {
  type AxiosError,
  type AxiosRequestConfig,
  type AxiosResponse,
  type InternalAxiosRequestConfig,
  type Method
} from 'axios';
import { baseUrlOption, getEnvByWebUrl } from '../utils';

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

/**
 * httpRequest 请求选项类型
 */
export type RequestType<TQuery extends AnyObject = AnyObject, TBody = unknown> = {
  url: string;
  baseURL?: string;
  method?: Method;
  data?: TBody;
  params?: TQuery;
  headers?: Record<string, string>;
  timeout?: number;
  axios?: Omit<AxiosRequestConfig, 'url' | 'method' | 'params' | 'data' | 'headers' | 'timeout'>;
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

const [domainKey, envKey] = getEnvByWebUrl();

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
  const method = (options.method ?? 'POST').toUpperCase() as Method;
  const headers: Record<string, string> = {
    Accept: 'application/json',
    'X-Requested-With': 'XMLHttpRequest',
    ...(options.headers ?? {})
  };

  const url = options.url;
  const query = options.params ? stripNil(options.params) : undefined;
  let baseURL = options.baseURL ?? baseUrlOption[domainKey]?.[envKey]?.projUrl;
  if (url.indexOf('/mock/') === 0) baseURL = '';
  else if (url.indexOf('/user-center/') === 0)
    baseURL = baseUrlOption[domainKey]?.[envKey]?.authUrl;

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

    if (!payload || typeof payload !== 'object') {
      throw new HttpError('Invalid response payload', {
        status: resp.status,
        url,
        method,
        data: payload,
        isNetworkError: false
      });
    }

    // 后端成功码可能是字符串 "0" 或数字 0。
    if (payload.code !== '0' && payload.code !== 0) {
      throw new HttpError(payload.message || 'Request failed', {
        status: resp.status,
        url,
        method,
        data: payload,
        code: payload.code,
        isNetworkError: false
      });
    }

    return payload.result;
  } catch (e) {
    if (!axios.isAxiosError(e)) {
      if (e instanceof HttpError) throw e;
      const message = e instanceof Error ? e.message : 'Request failed';
      throw new HttpError(message, { url, method, isNetworkError: true });
    }

    const err = e as AxiosError;
    const status = err.response?.status;
    const responseData = err.response?.data as unknown;
    const message =
      (typeof responseData === 'string'
        ? responseData
        : typeof responseData === 'object' &&
            responseData &&
            'message' in (responseData as AnyObject)
          ? String((responseData as AnyObject).message)
          : err.message) || 'Request failed';

    throw new HttpError(message, {
      status,
      url,
      method,
      data: responseData,
      code: err.code,
      isNetworkError: !err.response
    });
  }
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

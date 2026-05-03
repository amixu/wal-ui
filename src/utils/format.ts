/**
 * 将日期值格式化为日期或日期时间字符串（本地时区）。
 *
 * 主要职责：
 * - 统一输出 `YYYY-MM-DD` 与 `YYYY-MM-DD HH:mm:ss` 两种格式
 * - 兼容 `Date`、时间戳与可解析的日期字符串输入
 *
 * 参数说明：
 * - `value`：日期输入（`Date` / 时间戳 / 可被 `new Date()` 解析的字符串）
 * - `type`：输出类型，默认 `datetime`
 *   - `'date'`：仅日期，格式 `YYYY-MM-DD`
 *   - `'datetime'`：日期时间，格式 `YYYY-MM-DD HH:mm:ss`
 *
 * 返回值：
 * - `string`：格式化后的日期字符串
 *
 * 注意事项：
 * - 函数内部直接调用 `new Date(value)`；若输入非法，结果字符串可能出现 `NaN`
 */
export function formatDateTime(
  value: string | number | Date,
  type: 'date' | 'datetime' = 'datetime'
) {
  const date = new Date(value);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  if (type === 'date') {
    return `${year}-${month}-${day}`;
  }
  const hour = String(date.getHours()).padStart(2, '0');
  const minute = String(date.getMinutes()).padStart(2, '0');
  const second = String(date.getSeconds()).padStart(2, '0');
  return `${year}-${month}-${day} ${hour}:${minute}:${second}`;
}

/**
 * 将日期/时间字符串解析为毫秒级时间戳（本地时区）。
 *
 * 主要职责：
 * - 支持常见日期与日期时间字符串格式解析
 * - 兼容 `T` 作为日期时间分隔符
 * - 在无法识别时返回可判定的兜底值 `0`
 *
 * 参数说明：
 * - `value`：日期/时间字符串，支持以下格式
 *   - `YYYY-MM-DD`
 *   - `YYYY-MM-DD HH:mm`
 *   - `YYYY-MM-DD HH:mm:ss`
 *   - 以及对应的 `T` 分隔形式（如 `YYYY-MM-DDTHH:mm:ss`）
 *
 * 返回值：
 * - `number`：解析成功返回毫秒时间戳，解析失败返回 `0`
 */
export function parseDateTime(value: string): number {
  const input = value.trim();
  const normalized = input.replace('T', ' ');
  const hasTime = normalized.length !== 10;
  const hasSeconds = normalized.length === 19;
  const pattern =
    normalized.length === 10
      ? /^(\d{4})-(\d{2})-(\d{2})$/
      : normalized.length === 16
        ? /^(\d{4})-(\d{2})-(\d{2}) (\d{2}):(\d{2})$/
        : normalized.length === 19
          ? /^(\d{4})-(\d{2})-(\d{2}) (\d{2}):(\d{2}):(\d{2})$/
          : null;
  if (!pattern) return 0;

  const match = pattern.exec(normalized);
  if (!match) return 0;

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const hour = hasTime ? Number(match[4]) : 0;
  const minute = hasTime ? Number(match[5]) : 0;
  const second = hasSeconds ? Number(match[6]) : 0;
  const date = new Date(year, month - 1, day, hour, minute, second, 0);
  return date.getTime();
}

import cryptoJs from 'crypto-js';

/**
 * 使用 AES-ECB、PKCS7 填充，将密文解密为 UTF-8 字符串（与 `encrypt` 使用同一固定密钥）。
 *
 * 主要职责：
 * - 对接既有后端或网关约定的对称加密格式（CryptoJS 默认输出）
 *
 * 注意事项：
 * - 密钥写在前端 bundle 中，仅防君子不防逆向，不可替代服务端鉴权或 HTTPS
 * - ECB 模式无 IV，相同明文会得到相同密文，敏感场景应评估是否需升级方案
 *
 * @param wordStr 密文字符串（通常为 OpenSSL/Base64 风格）
 * @returns 解密后的明文
 */
export function decrypt(wordStr: string): string {
  const keyStr = 'bf960145b2a1338f';
  const key = cryptoJs.enc.Utf8.parse(keyStr);
  const decrypt = cryptoJs.AES.decrypt(wordStr, key, {
    mode: cryptoJs.mode.ECB,
    padding: cryptoJs.pad.Pkcs7
  });
  return cryptoJs.enc.Utf8.stringify(decrypt).toString();
}

/**
 * 使用 AES-ECB、PKCS7 填充，将 UTF-8 明文加密为可传输的密文字符串。
 *
 * @param token 明文（如 token 片段、需遮蔽的查询参数等）
 * @returns 与 `decrypt` 互逆的密文字符串
 */
export function encrypt(token: string): string {
  const key = cryptoJs.enc.Utf8.parse('bf960145b2a1338f');
  const srcs = cryptoJs.enc.Utf8.parse(token);
  const encrypted = cryptoJs.AES.encrypt(srcs, key, {
    mode: cryptoJs.mode.ECB,
    padding: cryptoJs.pad.Pkcs7
  });
  return encrypted.toString();
}

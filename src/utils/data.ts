import type { DomainEnvType } from './env';

/** 各运行环境对应的认证与项目站点根 URL，供登录跳转与接口基址使用。 */
export const baseUrlOption: DomainEnvType = {
  inner: {
    qa: {
      authUrl: 'https://test-qa.cn.amixu.com',
      projUrl: 'https://test-qa.cn.amixu.com'
    },
    dev: {
      authUrl: 'https://test-qa.cn.amixu.com',
      projUrl: 'https://test-dev.cn.amixu.com'
    },
    uat: {
      authUrl: 'https://test-qa.cn.amixu.com',
      projUrl: 'https://test-uat.cn.amixu.com'
    },
    qacanary: {
      authUrl: 'https://test-qa.cn.amixu.com',
      projUrl: 'https://test-qa.cn.amixu.com'
    },
    canary: {
      authUrl: 'https://test.cn.amixu.com',
      projUrl: 'https://test.cn.amixu.com'
    },
    prod: {
      authUrl: 'https://test.cn.amixu.com',
      projUrl: 'https://test.cn.amixu.com'
    }
  },
  outer: {
    qa: {
      authUrl: 'https://test-qa.amixumobile.cn',
      projUrl: 'https://test-qa.amixumobile.cn'
    },
    dev: {
      authUrl: 'https://test-qa.amixumobile.cn',
      projUrl: 'https://test-dev.amixumobile.cn'
    },
    uat: {
      authUrl: 'https://test-qa.amixumobile.cn',
      projUrl: 'https://test-uat.amixumobile.cn'
    },
    prod: {
      authUrl: 'https://test.amixumobile.cn',
      projUrl: 'https://test.amixumobile.cn'
    }
  }
};

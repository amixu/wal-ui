import { httpRequest } from './request';
import type { MenuItemType } from './tree';

export async function getUserInfo(): Promise<Record<string, string>> {
  const result: Record<string, string> = await httpRequest({
    url: '/user-center/getUserByToken',
    data: { token: localStorage.getItem(`token_${sessionStorage.getItem('appId')}`) || 'xxx' }
  });
  sessionStorage.setItem('userId', result.userId);
  const { userId, name: nickName } = result;
  return { userId, nickName };
}

export async function getUserDetailInfo(): Promise<Record<string, string>> {
  const result: Record<string, string> = await httpRequest({
    url: '/user-center/user/queryByUserId',
    data: { userId: sessionStorage.getItem('userId') }
  });
  const { userId, nickName, avatar, email, storeId } = result;
  return { userId, nickName, avatar, email, storeId };
}

export async function getAuthorities(): Promise<MenuItemType[]> {
  const result = await httpRequest<MenuItemType[]>({
    url: '/user-center/security/user/authorities'
  });
  return result;
}

export async function loginOut() {
  await httpRequest<MenuItemType[]>({
    url: '/user-center/loginOut',
    data: { token: localStorage.getItem(`token_${sessionStorage.getItem('appId')}`) }
  });
}

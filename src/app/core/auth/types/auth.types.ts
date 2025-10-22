export type AuthRole = 'USER' | 'CAPTAIN' | 'ADMIN' | 'GUEST';
export type LoginResp = {
  accessToken: string;
  refreshToken: string;
  user?: { avatarUrl?: string };
};

import { AuthRole } from '../types';

export interface AuthUser {
  id: string;
  email?: string | null;
  name?: string | null;
  role?: AuthRole;
  avatarUrl?: string | null;
}

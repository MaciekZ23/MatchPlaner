export interface AppNotification {
  id: string;
  message: string;
  type: 'info' | 'success' | 'warning';
  createdAt: number;
}
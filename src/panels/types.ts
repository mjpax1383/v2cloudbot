export interface VPNConfig {
  remark: string;
  volumeGb: number;
  expiryDays: number;
}

export interface VPNUser {
  identifier: string;
  configLink: string;
  volumeUsedGb: number;
  totalVolumeGb: number;
  expiryDate: Date | null;
  status: 'active' | 'expired' | 'limited' | 'disabled';
}

export interface IVPNPanel {
  login(): Promise<void>;
  createUser(config: VPNConfig): Promise<VPNUser>;
  getUser(identifier: string): Promise<VPNUser>;
  updateUser(identifier: string, config: Partial<VPNConfig>): Promise<void>;
  deleteUser(identifier: string): Promise<void>;
  getTraffic(identifier: string): Promise<{ used: number; total: number }>;
}

export abstract class BaseVPNPanel implements IVPNPanel {
  constructor(protected apiUrl: string, protected credentials: { username?: string; password?: string; token?: string }) {}
  abstract login(): Promise<void>;
  abstract createUser(config: VPNConfig): Promise<VPNUser>;
  abstract getUser(identifier: string): Promise<VPNUser>;
  abstract updateUser(identifier: string, config: Partial<VPNConfig>): Promise<void>;
  abstract deleteUser(identifier: string): Promise<void>;
  abstract getTraffic(identifier: string): Promise<{ used: number; total: number }>;
}

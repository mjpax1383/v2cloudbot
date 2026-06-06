import { BaseVPNPanel, VPNConfig, VPNUser } from './types';

export class MarzbanPanel extends BaseVPNPanel {
  private accessToken: string | null = null;

  async login(): Promise<void> {
    const response = await fetch(`${this.apiUrl}/api/admin/token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        username: this.credentials.username || '',
        password: this.credentials.password || '',
      }),
    });
    if (!response.ok) throw new Error('Marzban login failed');
    const data: any = await response.json();
    this.accessToken = data.access_token;
  }

  async createUser(config: VPNConfig): Promise<VPNUser> {
    if (!this.accessToken) await this.login();
    const response = await fetch(`${this.apiUrl}/api/user`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.accessToken}`,
      },
      body: JSON.stringify({
        username: config.remark,
        data_limit: config.volumeGb * 1024 * 1024 * 1024,
        expire: Math.floor(Date.now() / 1000) + config.expiryDays * 86400,
      }),
    });
    if (!response.ok) throw new Error('Marzban user creation failed');
    const data: any = await response.json();
    return {
      identifier: data.username,
      configLink: data.subscription_url,
      volumeUsedGb: data.used_traffic / (1024 ** 3),
      totalVolumeGb: data.data_limit / (1024 ** 3),
      expiryDate: data.expire ? new Date(data.expire * 1000) : null,
      status: data.status,
    };
  }

  async getUser(identifier: string): Promise<VPNUser> {
    if (!this.accessToken) await this.login();
    const response = await fetch(`${this.apiUrl}/api/user/${identifier}`, {
      headers: { 'Authorization': `Bearer ${this.accessToken}` },
    });
    if (!response.ok) throw new Error('Marzban get user failed');
    const data: any = await response.json();
    return {
      identifier: data.username,
      configLink: data.subscription_url,
      volumeUsedGb: data.used_traffic / (1024 ** 3),
      totalVolumeGb: data.data_limit / (1024 ** 3),
      expiryDate: data.expire ? new Date(data.expire * 1000) : null,
      status: data.status,
    };
  }

  async updateUser(identifier: string, config: Partial<VPNConfig>): Promise<void> {
    if (!this.accessToken) await this.login();
    // Implementation for update
  }

  async deleteUser(identifier: string): Promise<void> {
    if (!this.accessToken) await this.login();
    await fetch(`${this.apiUrl}/api/user/${identifier}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${this.accessToken}` },
    });
  }

  async getTraffic(identifier: string): Promise<{ used: number; total: number }> {
    const user = await this.getUser(identifier);
    return { used: user.volumeUsedGb, total: user.totalVolumeGb };
  }
}

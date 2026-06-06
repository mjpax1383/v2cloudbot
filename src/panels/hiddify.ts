import { BaseVPNPanel, VPNConfig, VPNUser } from './types';

export class HiddifyPanel extends BaseVPNPanel {
  async login(): Promise<void> {
    // Hiddify uses a secret in the URL or an API key
  }

  async createUser(config: VPNConfig): Promise<VPNUser> {
    const response = await fetch(`${this.apiUrl}/api/v1/admin/user/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Hiddify-API-Key': this.credentials.token || ''
      },
      body: JSON.stringify({
        name: config.remark,
        usage_limit_GB: config.volumeGb,
        package_days: config.expiryDays,
      }),
    });
    if (!response.ok) throw new Error('Hiddify user creation failed');
    const data: any = await response.json();
    return {
        identifier: data.uuid,
        configLink: `https://yourdomain.com/path/${data.uuid}/`,
        volumeUsedGb: data.current_usage_GB,
        totalVolumeGb: data.usage_limit_GB,
        expiryDate: null, // Hiddify handles start on first use
        status: 'active',
    };
  }

  async getUser(identifier: string): Promise<VPNUser> {
    return {} as VPNUser;
  }

  async updateUser(identifier: string, config: Partial<VPNConfig>): Promise<void> {}
  async deleteUser(identifier: string): Promise<void> {}
  async getTraffic(identifier: string): Promise<{ used: number; total: number }> {
    return { used: 0, total: 0 };
  }
}

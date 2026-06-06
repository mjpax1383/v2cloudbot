import { BaseVPNPanel, VPNConfig, VPNUser } from './types';

export class XUI3Panel extends BaseVPNPanel {
  private cookie: string | null = null;

  async login(): Promise<void> {
    const response = await fetch(`${this.apiUrl}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        username: this.credentials.username || '',
        password: this.credentials.password || '',
      }),
    });
    if (!response.ok) throw new Error('3x-ui login failed');
    const setCookie = response.headers.get('set-cookie');
    if (setCookie) {
      this.cookie = setCookie.split(';')[0];
    }
  }

  async createUser(config: VPNConfig): Promise<VPNUser> {
    if (!this.cookie) await this.login();

    const inboundId = 1;
    const uuid = crypto.randomUUID();

    const client = {
      id: uuid,
      alterId: 0,
      email: config.remark,
      limitIp: 0,
      totalGb: config.volumeGb * 1024 * 1024 * 1024,
      expiryTime: Date.now() + config.expiryDays * 86400000,
      enable: true,
      tgId: '',
      subId: '',
    };

    const response = await fetch(`${this.apiUrl}/panel/api/inbounds/addClient`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': this.cookie || '',
      },
      body: JSON.stringify({
        id: inboundId,
        settings: JSON.stringify({ clients: [client] }),
      }),
    });

    if (!response.ok) throw new Error('3x-ui user creation failed');

    return {
      identifier: config.remark, // Use remark (email) as identifier in 3x-ui
      configLink: `${this.apiUrl}/sub/${uuid}`,
      volumeUsedGb: 0,
      totalVolumeGb: config.volumeGb,
      expiryDate: new Date(client.expiryTime),
      status: 'active',
    };
  }

  async getUser(identifier: string): Promise<VPNUser> {
    if (!this.cookie) await this.login();

    const response = await fetch(`${this.apiUrl}/panel/api/inbounds/list`, {
        headers: { 'Cookie': this.cookie || '' }
    });
    const data: any = await response.json();

    for (const inbound of data.obj) {
        const settings = JSON.parse(inbound.settings);
        const client = settings.clients.find((c: any) => c.email === identifier);
        if (client) {
            const clientStats = data.obj.flatMap((i: any) => i.clientStats).find((s: any) => s.email === identifier);
            return {
                identifier: client.email,
                configLink: `${this.apiUrl}/sub/${client.id}`,
                volumeUsedGb: (clientStats?.up + clientStats?.down) / (1024 ** 3) || 0,
                totalVolumeGb: client.totalGb / (1024 ** 3),
                expiryDate: new Date(client.expiryTime),
                status: client.enable ? 'active' : 'disabled',
            };
        }
    }
    throw new Error('User not found on 3x-ui');
  }

  async updateUser(identifier: string, config: Partial<VPNConfig>): Promise<void> {}
  async deleteUser(identifier: string): Promise<void> {}
  async getTraffic(identifier: string): Promise<{ used: number; total: number }> {
    const user = await this.getUser(identifier);
    return { used: user.volumeUsedGb, total: user.totalVolumeGb };
  }
}

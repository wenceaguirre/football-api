import { MainUsersService } from './mainusers.service';

describe('MainUsersService', () => {
  it('creates admin user from env variables', async () => {
    process.env.ADMIN_EMAIL = 'wence@XAcademy.dev';
    process.env.ADMIN_PASSWORD = 'secret';
    const service = new MainUsersService();
    const user = await service.findByEmail('wence@XAcademy.dev');
    expect(user).not.toBeNull();
    expect(user?.email).toBe('wence@XAcademy.dev');
  });
});


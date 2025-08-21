import * as bcrypt from 'bcrypt';

export type User = {id: number; email: string; passwordHash: string; name: string };

export class MainUsersService {
    private users: User[] = [];

    constructor() {
        const hash = bcrypt.hashSync('admin123', 10)
        this.users.push({id: 1, email: 'wence@XAcademy.dev', passwordHash: hash, name: 'admin123'})
    }

    async findByEmail(email: string) {
        return this.users.find(u => u.email === email) ?? null;
    }
}
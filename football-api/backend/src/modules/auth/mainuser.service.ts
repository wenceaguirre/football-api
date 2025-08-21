import * as bcrypt from 'bcrypt';

export type User = {id: number; email: string; passwordHash: string; name: string };

export class MainUserService {
    private users: User[] = [];

    constructor() {
        const hash = bcrypt.hashSync('admin123', 10)
        this.users.push({id: 1, email: 'admin@XAcademy.dev', passwordHash: hash, name: 'Admin'})
    }

    async findByEmail(email: string) {
        return this.users.find(u => u.email === email) ?? null;
    }
}
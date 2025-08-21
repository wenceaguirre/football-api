import { Injectable, UnauthorizedException } from "@nestjs/common";
import { MainUserService } from "./mainuser.service";
import * as bcrypt from 'bcrypt';
import { JwtService } from "@nestjs/jwt";
import { UserService } from "../users/user.service";

@Injectable()
export class AuthService {
    constructor(private users: UserService, private jwt: JwtService) {}
    
    async validateUser(email: string, password: string) {
        const user = await this.users.findByEmail(email);
        if (!user) throw new UnauthorizedException('Invalid credentials');
        const ok = await bcrypt.compare(password, user.passwordHash);
        if (!ok) throw new UnauthorizedException('Invalid credentials');
        return user;
    }

    async login (user: {id: number; email: string; name: string}) {
        const payload = {sub: user.id, email: user.email, name: user.name};
        const access_token = await this.jwt.signAsync(payload);
        return { access_token };
    }
}
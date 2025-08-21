import { Injectable, ConflictException } from "@nestjs/common";
import { InjectModel } from "@nestjs/sequelize";
import { UserModel } from "./user.model";
import * as bcrypt from 'bcrypt';

@Injectable()
export class UserService {
    constructor(@InjectModel(UserModel)private readonly users: typeof UserModel){}

    async findByEmail(email: string){
        return this.users.findOne({where: { email }})
    }

    async create(email: string, name: string, password: string) {
        const exist = await this.findByEmail(email);
        if (exist) throw new ConflictException('Email already registered');
        const passwordHash = await bcrypt.hash(password, 10)
        return this.users.create({ email, name, passwordHash});
    }
}
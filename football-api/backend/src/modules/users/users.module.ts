import { Module } from "@nestjs/common";
import { SequelizeModule } from "@nestjs/sequelize";
import { UserModel } from "./user.model";
import { UserService } from "./user.service";
import { MainUserService } from "../auth/mainuser.service";
@Module({
    imports: [SequelizeModule.forFeature([UserModel])],
    providers: [MainUserService, UserService],
    exports: [MainUserService, UserService],
})
export class UserModule {}
import { Table, Column, Model, DataType, PrimaryKey, AutoIncrement, Unique, } from "sequelize-typescript";
import { InferAttributes, InferCreationAttributes, CreationOptional } from "sequelize";

@Table({ tableName: 'users', timestamps: true})
export class UserModel extends Model<InferAttributes<UserModel>, InferCreationAttributes<UserModel>> {
    @PrimaryKey
    @AutoIncrement
    @Column(DataType.INTEGER)
    declare id: CreationOptional<number>;

    @Unique
    @Column({type: DataType.STRING, allowNull: false})
    declare email: string;

    @Column({field: 'password_hash', type: DataType.STRING, allowNull: false})
    declare passwordHash: string;

    @Column({type: DataType.STRING, allowNull: false})
    declare name: string;
}
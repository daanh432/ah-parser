import { pbkdf2Sync, randomBytes } from "crypto";
import { Pakbon } from "./Pakbon";
import { CreationOptional, DataTypes, InferAttributes, InferCreationAttributes, Model } from "sequelize";
import { sequelize } from "..";

const ITERATIONS = 600_000;

const hashPassword = (password: string): string => {
    const salt = randomBytes(32).toString('hex');
    const hash = pbkdf2Sync(password, salt, ITERATIONS, 64, 'sha512').toString('hex');
    return `${salt}:$:${hash}:$:${ITERATIONS}`;
};

export class User extends Model<InferAttributes<User>, InferCreationAttributes<User>> {
    declare id: CreationOptional<number>;
    declare name: string;
    declare email: string;
    declare password: string;
    declare remember_token?: string;

    public getRememberToken(): string | undefined {
        return this.remember_token;
    }

    public newRememberToken(): string {
        const newToken = randomBytes(64).toString('hex');
        this.remember_token = newToken;
        this.save();
        return newToken;
    }

    public getId(): number {
        if (this.id == null)
            throw Error("User has not been persisted to database");

        return this.id;
    }

    public getName(): string {
        return this.name;
    }

    public getEmail(): string {
        return this.email;
    }

    public getPasswordHash(): any {
        return this.password;
    }

    public async checkPassword(password: string): Promise<boolean> {
        const passwordSplit: string[] = this.password.split(':$:');
        if (passwordSplit[0] == null || passwordSplit[1] == null || passwordSplit[2] == null) return false;
        const salt = passwordSplit[0];
        const derivedKey = passwordSplit[1];
        const iterations = Number.parseInt(passwordSplit[2]);

        let hash = pbkdf2Sync(password, salt, iterations, 64, 'sha512').toString('hex');

        const valid = derivedKey === hash;

        if (valid && iterations < ITERATIONS) {
            this.password = hashPassword(password);
            await this.save();
        }

        return valid;
    }

    public getPakbons(): Promise<Pakbon[]> {
        return Pakbon.findAll({ where: { from_email: this.email } });
    }
}

User.init({
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false
    },
    remember_token: {
        type: DataTypes.STRING,
        allowNull: true
    }
}, {
    sequelize,
    modelName: 'User'
});

User.beforeCreate(async (user, options) => {
    const hashedPassword = hashPassword(user.password);
    user.password = hashedPassword;
});
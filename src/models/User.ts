import { plainToClass } from "class-transformer";
import { pbkdf2Sync, randomBytes } from "crypto";
import { Mysql } from "../datasources/Mysql";
import { Pakbon } from "./Pakbon";

const ITERATIONS = 600_000;

export class User {
    private id: number | null;
    private name: string;
    private email: string;
    private password: string;
    private remember_token: string | null;

    constructor(id: number | null, name: string, email: string, password: string) {
        this.id = id;
        this.name = name;
        this.email = email;
        this.remember_token = null;

        this.password = password;
        if (password != undefined) {
            this.updatePassword(password);
        }
    }

    public getRememberToken(): string | null {
        return this.remember_token;
    }

    public newRememberToken(): string {
        const newToken = randomBytes(64).toString('hex');

        Mysql.getConnection((err, connection) => {
            if (err) {
                console.error(err);
                return;
            }

            connection.query("UPDATE `users` SET `remember_token`=?", [newToken], (err, results) => {
                connection.release();
                if (err) {
                    console.error(err);
                    return;
                }
            });
        });

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

    private updatePassword(password: string): void {
        const salt = randomBytes(16).toString('hex'); 
        const hash = pbkdf2Sync(password, salt, ITERATIONS, 64, 'sha512').toString('hex');
        this.password = `${salt}:$:${hash}:$:${ITERATIONS}`;
    }

    public checkPassword(password: string): boolean {
        const passwordSplit: string[] = this.password.split(':$:');
        if (passwordSplit[0] == null || passwordSplit[1] == null || passwordSplit[2] == null) return false;
        const salt = passwordSplit[0];
        const derivedKey = passwordSplit[1];
        const iterations = Number.parseInt(passwordSplit[2]);

        let hash = pbkdf2Sync(password, salt, iterations, 64, 'sha512').toString('hex');

        const valid = derivedKey === hash;

        if (valid && iterations < ITERATIONS) {
            this.updatePassword(password);
            Mysql.updateUser(this);
        }

        return valid;
    }

    public getPakbons(): Promise<Pakbon[]> {
        return new Promise((resolve, reject) => {
            Mysql.getConnection((err, connection) => {
                if (err) {
                    reject(err)
                    return;
                }

                connection.query("SELECT * FROM `package_slip` WHERE `from_email` = ?", [this.getEmail()], (err, results) => {
                    connection.release();
                    if (err) {
                        reject(err);
                        return;
                    }

                    if (results.length === 0) {
                        resolve([]);
                        return;
                    }

                    resolve(plainToClass(Pakbon, results as object[]));
                })
            });
        });
    }
}
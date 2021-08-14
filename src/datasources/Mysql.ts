import { plainToClass } from "class-transformer";
import { createPool, MysqlError, Pool, PoolConnection } from "mysql";
import { Pakbon } from "../models/Pakbon";
import { Product } from "../models/Product";
import { User } from "../models/User";

export class Mysql {
    private static pool: Pool

    constructor(host: string | undefined, port: string | undefined, user: string | undefined, password: string | undefined, database: string | undefined) {
        if (host == undefined || port == undefined || user == undefined || password == undefined || database == undefined) {
            throw Error("Mysql details are required");
        }

        Mysql.pool = createPool({
            connectionLimit: 25,
            host: host,
            port: Number.parseInt(port),
            user: user,
            password: password,
            database: database,
        });
    }

    public static getPool() {
        return Mysql.pool;
    }

    public static getConnection(callback: (err: MysqlError, connection: PoolConnection) => void) {
        Mysql.pool.getConnection(callback);
    }

    public connect() {
        Mysql.getConnection((err, connection) => {
            if (err) throw err;

            connection.query("CREATE TABLE IF NOT EXISTS `users` ( `id` INT NOT NULL AUTO_INCREMENT , `email` VARCHAR(255) NOT NULL , `name` VARCHAR(255) NOT NULL , `password` VARCHAR(255) NOT NULL , `remember_token` VARCHAR(255) NULL DEFAULT NULL , PRIMARY KEY (`id`), UNIQUE (`email`)) ENGINE = InnoDB;", (err, result) => {
                if (err) throw err;
                connection.query("CREATE TABLE IF NOT EXISTS `package_slip` ( `id` INT NOT NULL AUTO_INCREMENT , `from_email` VARCHAR(255) NOT NULL , `order_number` VARCHAR(32) NOT NULL , `date` INT UNSIGNED NOT NULL , `message` VARCHAR(255) NOT NULL , PRIMARY KEY (`id`), INDEX `from_email_index` (`from_email`), UNIQUE `order_number_unique` (`order_number`)) ENGINE = InnoDB;", (err, result) => {
                    if (err) throw err;
                    connection.query("CREATE TABLE IF NOT EXISTS `package_slip_products` ( `id` INT NOT NULL AUTO_INCREMENT , `package_slip_id` INT NOT NULL , `name` VARCHAR(255) NOT NULL , `amount` INT NOT NULL , `price` DOUBLE(10,2) NOT NULL , `total_price` DOUBLE(10,2) NOT NULL , `checked` TINYINT NOT NULL , PRIMARY KEY (`id`)) ENGINE = InnoDB;", (err, result) => {
                        if (err) throw err;
                        connection.release();
                    });
                });
            });
        })
    }

    private static getPakbon(id: any, query: string): Promise<Pakbon|null> {
        return new Promise((resolve, reject) => {
            Mysql.getConnection((err, connection) => {
                if (err) {
                    reject(err);
                    return;
                }
                
                connection.query(query, [id], (err, results) => {
                    if (err) {
                        connection.release();
                        reject(err);
                        return;
                    }

                    if (results.length < 1) {
                        connection.release();
                        resolve(null);
                        return;
                    }

                    connection.query("SELECT * FROM `package_slip_products` psp WHERE psp.package_slip_id = ? ORDER BY `name` ASC", [results[0].id], (err, results2) => {
                        connection.release();
                        if (err) {
                            reject(err)
                            return;
                        }

                        results[0].products = results2;

                        let pakbon: Pakbon = plainToClass(Pakbon, results[0] as object);
                        resolve(pakbon);
                    });
                });
            })
        });
    }

    public static getPakbonById(id: number): Promise<Pakbon|null> {
        return this.getPakbon(id, "SELECT * FROM `package_slip` ps WHERE ps.id = ?");
    }

    public static getPakbonByOrderNumber(order_number: string): Promise<Pakbon|null> {
        return this.getPakbon(order_number, "SELECT * FROM `package_slip` ps WHERE ps.order_number = ?");
    }

    private static getProduct(id: any, query: string): Promise<Product|null> {
        return new Promise((resolve, reject) => {
            Mysql.getConnection((err, connection) => {
                if (err) {
                    reject(err);
                    return;
                }
                
                connection.query(query, [id], (err, results) => {
                    connection.release();
                    if (err) {
                        reject(err);
                        return;
                    }

                    if (results.length < 1) {
                        resolve(null);
                        return;
                    }

                    let product: Product = plainToClass(Product, results[0] as object);
                    resolve(product);
                });
            })
        });
    }

    public static getProductById(id: number): Promise<Product|null> {
        return this.getProduct(id, "SELECT * FROM `package_slip_products` psp WHERE psp.id = ?");
    }

    public static toggleProductById(id: number, state: boolean): Promise<void> {
        return new Promise((resolve, reject) => {
            Mysql.getConnection((err, connection) => {
                if (err) {
                    reject(err);
                    return;
                }

                connection.query("UPDATE `package_slip_products` psp SET psp.checked = ? WHERE psp.id = ?", [state ? 1 : 0, id], (err, result) => {
                    connection.release();
                    if (err) {
                        reject(err);
                        return;
                    }

                    resolve();
                    return;
                });
            });
        });
    }

    public static storePakbon(pakbon: Pakbon): void {
        Mysql.getConnection((err, connection) => {
            if (err) throw err;
            connection.beginTransaction((err) => {
                if (err) throw err;
                connection.query("INSERT INTO `package_slip`(`from_email`, `order_number`, `message`, `date`) VALUES (?, ?, ?, ?)",
                [pakbon.getFromEmail(), pakbon.getOrderNumber(), pakbon.getMessage(), pakbon.getDateUnix()],
                (err, result) => {
                    if (err) throw err;

                    let products = pakbon.getProducts();
                    for (let i = 0; i < products.length; i++) {
                        const product: Product | undefined = products[i];
                        if (!product) continue;
                        connection.query("INSERT INTO `package_slip_products`(`package_slip_id`, `name`, `amount`, `price`, `total_price`, `checked`) VALUES (?, ?, ?, ?, ?, ?)",
                        [result.insertId, product.getName(), product.getAmount(), product.getPrice(), product.getTotalPrice(), product.getChecked() ? 1 : 0],
                        (err, result) => {
                            if (err)
                                throw err;

                            if (products.length - 1 === i) {
                                connection.commit((err) => {
                                    if (err) 
                                        throw err;
                                    connection.release();
                                })
                            }
                        });
                    }
                })
            });
        });
    }

    private static getUser(id: any, query: string): Promise<User|null> {
        return new Promise((resolve, reject) => {
            Mysql.getConnection((err, connection) => {
                if (err) {
                    reject(err);
                    return;
                }
                
                connection.query(query, [id], (err, results) => {
                    connection.release();
                    if (err) {
                        reject(err);
                        return;
                    }

                    if (results.length < 1) {
                        resolve(null);
                        return;
                    }

                    let pakbon: any = plainToClass(User, results[0] as object);
                    resolve(pakbon);
                });
            })
        });
    }

    public static getUserById(id: number): Promise<User|null> {
        return this.getUser(id, "SELECT * FROM `users` u WHERE u.id = ?");
    }

    public static getUserByEmail(email: string): Promise<User|null> {
        return this.getUser(email, "SELECT * FROM `users` u WHERE u.email = ?");
    }

    public static storeUser(user: User): void {
        Mysql.getConnection((err, connection) => {
            if (err) throw err;
            connection.query("INSERT INTO `users` (`name`, `email`, `password`) VALUES (?, ?, ?)", [user.getName(), user.getEmail(), user.getPasswordHash()], (err, result) => {
                if (err) throw err;
                connection.release();
            })
        });
    }
}
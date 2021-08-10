import "reflect-metadata";
import { Type } from "class-transformer";
import { Product } from "./Product";
import { User } from "./User";
import moment from "moment";

class Pakbon {
    private id: number;
    private from_email: string;
    private order_number: string;
    private message: string;
    private date: number;

    @Type(() => Product)
    private products: Product[];

    constructor(id: number | null, from_email: string, order_number: string, message: string) {
        this.id = id ? id : -1;
        this.from_email = from_email;
        this.order_number = order_number;
        this.message = message;
        this.products = [];
        this.date = moment().unix();
    }

    public getId(): number {
        return this.id;
    }

    public getFromEmail(): string {
        return this.from_email;
    }

    public getOrderNumber(): string {
        return this.order_number;
    }

    public getMessage(): string {
        return this.message;
    }

    public getProducts(): Product[] {
        return this.products;
    }

    public addProduct(product: Product): void {
        this.products.push(product);
    }

    public userCanView(user: User): boolean {
        return this.getFromEmail() === user.getEmail();
    }

    public getDateUnix(): number {
        return this.date;
    }
}

export { Pakbon }
import "reflect-metadata";
import { Type } from "class-transformer";
import { Product } from "./Product";

class Pakbon {
    private id: string;
    private message: string;

    @Type(() => Product)
    private products: Product[];

    constructor(id: string | number, message: string) {
        this.id = '' + id;
        this.message = message;
        this.products = [];
    }

    public getId(): string {
        return this.id;
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
}

export { Pakbon }
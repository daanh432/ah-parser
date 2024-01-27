enum ProductStatus {
    DELIVERED = 'DELIVERED',
    FREE = 'FREE',
    OUT_OF_STOCK = 'OUT_OF_STOCK'
}

class Product {
    private id: number;
    private name: string;
    private amount: number;
    private price: number;
    private total_price: number;
    private checked: boolean;
    private from: string;
    private status: ProductStatus

    constructor(name: string, amount: number, price: number, total_price: number, from: string, status: ProductStatus) {
        this.id = -1;
        this.name = name;
        this.amount = amount;
        this.price = price;
        this.total_price = total_price;
        this.checked = false;
        this.from = from;
        this.status = status;
    }

    public getId(): number {
        return this.id;
    }

    public getName(): string {
        return this.name;
    }

    public getAmount(): number {
        return this.amount;
    }

    public getPrice(): number {
        return this.price;
    }

    public getTotalPrice(): number {
        return this.total_price;
    }

    public getChecked(): boolean {
        return this.checked;
    }

    public setChecked(checked: boolean) {
        this.checked = checked;
    }

    public getFrom(): string {
        return this.from;
    }

    public getStatus(): ProductStatus {
        return this.status;
    }
}

export {
    ProductStatus,
    Product
}
class Product {
    private name: string;
    private amount: number;
    private price: number;
    private total_price: number;
    private checked: boolean;
    private from: string;

    constructor(name: string, amount: number, price: number, total_price: number, from: string) {
        this.name = name;
        this.amount = amount;
        this.price = price;
        this.total_price = total_price;
        this.checked = false;
        this.from = from;
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
}

export {
    Product
}
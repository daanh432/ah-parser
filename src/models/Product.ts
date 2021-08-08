class Product {
    private name: string;
    private amount: number;
    private price: number;
    private total_price: number;
    private checked: boolean;

    constructor(name: string, amount: number, price: number, total_price: number) {
        this.name = name;
        this.amount = amount;
        this.price = price;
        this.total_price = total_price;
        this.checked = false;
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
}

export { Product }
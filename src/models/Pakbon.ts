import { sequelize } from "..";
import { Product } from "./Product";
import { User } from "./User";
import { Association, CreationOptional, DataTypes, InferAttributes, InferCreationAttributes, Model, NonAttribute } from "sequelize";

class Pakbon extends Model<InferAttributes<Pakbon>, InferCreationAttributes<Pakbon>> {
    declare id: CreationOptional<number>;
    declare from_email: string;
    declare order_number: string;
    declare message: string;
    declare date: number;

    declare products: NonAttribute<Product[]>;

    static override associations: {
        products: Association<Pakbon, Product>
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
        if (this.products == null) this.products = new Array<Product>();
        this.products.push(product);
    }

    public userCanView(user: User): boolean {
        return this.getFromEmail() === user.getEmail();
    }

    public getDateUnix(): number {
        return this.date;
    }

    public getDate(): Date {
        return new Date(this.date);
    }
}

Pakbon.init({
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    from_email: {
        type: DataTypes.STRING,
        allowNull: false
    },
    order_number: {
        type: DataTypes.STRING,
        allowNull: false
    },
    message: {
        type: DataTypes.STRING,
        allowNull: false
    },
    date: {
        type: DataTypes.INTEGER,
        allowNull: false
    }
}, {
    sequelize,
    modelName: 'Pakbon'
});

export { Pakbon }
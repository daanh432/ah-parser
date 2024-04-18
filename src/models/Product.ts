import { Association, CreationOptional, DataTypes, InferAttributes, InferCreationAttributes, Model, NonAttribute } from "sequelize";
import { sequelize } from "..";
import { Pakbon } from "./Pakbon";

enum ProductStatus {
    DELIVERED = 'DELIVERED',
    FREE = 'FREE',
    OUT_OF_STOCK = 'OUT_OF_STOCK'
}

class Product extends Model<InferAttributes<Product>, InferCreationAttributes<Product>> {
    declare id: CreationOptional<number>;

    declare package_slip_id: number;
    declare package_slip: NonAttribute<Pakbon>;

    declare name: string;
    declare amount: number;
    declare price: number;
    declare total_price: number;
    declare checked: boolean;
    declare status: ProductStatus

    static override associations: {
        package_slip: Association<Product, Pakbon>
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

    public getStatus(): ProductStatus {
        return this.status;
    }
}

Product.init({
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    package_slip_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    amount: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    price: {
        type: DataTypes.DOUBLE,
        allowNull: false
    },
    total_price: {
        type: DataTypes.DOUBLE,
        allowNull: false
    },
    checked: {
        type: DataTypes.BOOLEAN,
        allowNull: false
    },
    status: {
        type: DataTypes.STRING,
        allowNull: false
    }
}, {
    sequelize,
    modelName: 'Product',
});

// Participant relationship
Pakbon.hasMany(Product, {
    sourceKey: 'id',
    foreignKey: 'package_slip_id',
    as: 'products'
});

Product.belongsTo(Pakbon, {
    foreignKey: 'package_slip_id',
    as: 'package_slip'
});

export {
    ProductStatus,
    Product
}
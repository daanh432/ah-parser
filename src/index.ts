import * as dotenv from 'dotenv';
dotenv.config();

import { Sequelize } from "sequelize";
export const sequelize = new Sequelize(process.env.DB_URI ?? 'invalid', { logging: false });

import { Api } from "./api";
import { startTimer } from "./timer";

const api = new Api(process.env.API_SECRET!);

sequelize.authenticate()
    .then(async () => {
        await sequelize.sync();
        await sequelize.validate();
        api.start(process.env.PORT ? Number.parseInt(process.env.PORT) : 3000);

        startTimer();
    })
    .catch((err) => {
        console.error('Unable to connect to the database:', err);
        process.exit(1);
    });
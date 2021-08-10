import "reflect-metadata";
import * as dotenv from 'dotenv';
import { ImapListener } from './datasources/Imap';
import { Pakbon } from './models/Pakbon';
import { Api } from "./api";
import { Mysql } from "./datasources/Mysql";
dotenv.config();

const api = new Api("1234");
const mysql = new Mysql(process.env.MYSQL_HOST, process.env.MYSQL_PORT, process.env.MYSQL_USER, process.env.MYSQL_PASSWORD, process.env.MYSQL_DATABASE);
const imapListener = new ImapListener(process.env.IMAP_USER, process.env.IMAP_PASSWORD, process.env.IMAP_HOST, process.env.IMAP_PORT, process.env.IMAP_TLS === "true");

mysql.connect();
api.start(3000);

setTimeout(() => {
    console.log('test');
    imapListener.searchMessages(async (pakbon: Pakbon) => {
        let searchPakbon = await Mysql.getPakbonByOrderNumber(pakbon.getOrderNumber());
        if (searchPakbon != null) return;
        
        Mysql.storePakbon(pakbon);
        console.log(pakbon);
    });
}, 5000);


import "reflect-metadata";
import { plainToClass } from 'class-transformer';
import * as dotenv from 'dotenv';
import { db } from './datasources/ah';
import { ImapListener } from './datasources/Imap';
import { Pakbon } from './models/Pakbon';
dotenv.config();

const imapListener = new ImapListener(process.env.IMAP_USER, process.env.IMAP_PASSWORD, process.env.IMAP_HOST, process.env.IMAP_PORT, process.env.IMAP_TLS === "true");

setTimeout(() => {
    imapListener.searchMessages((pakbon: Pakbon) => {
        if (db.has(pakbon.getId())) return;


        db.set(pakbon.getId(), pakbon);
        console.log(pakbon);
    });
}, 5000);

let test: Pakbon = plainToClass(Pakbon, db.get('26561993') as object);
console.log(test.getProducts()[0]?.setChecked(true));
console.log(test);

db.set('26561993', test);

let test2: Pakbon = plainToClass(Pakbon, db.get('26561993') as object);
console.log(test2);
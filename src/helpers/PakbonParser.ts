import Cheerio from "cheerio";
import {
    Pakbon
} from "../models/Pakbon";
import { Product } from "../models/Product";

const parseVersionOne = (from: string, $: cheerio.Root): Pakbon | null => {
    let id = $('table > tbody > tr > td > table:nth-child(6) > tbody > tr:nth-child(2) > td:nth-child(2) > strong').text()?.split(':')[1]?.trim();
    let message = cleanString($('table > tbody > tr > td > table:nth-child(6) > tbody > tr:nth-child(2) > td:nth-child(2)').contents()[5]?.data)

    let productsContainer =  $('table > tbody > tr > td > table:nth-child(8) > tbody > tr:nth-child(1) > td:nth-child(1) > table:nth-child(1) > tbody > tr:nth-child(1) > td:nth-child(1) > table:nth-child(1) > tbody > tr');

    if (id == undefined || message == undefined)
        return null;

    let pakbon = new Pakbon(null, from, id, message);

    productsContainer.each((index, element) => {
        let elm = $(element);

        if (elm.text().indexOf('Prijs per stuk') > -1) return true;
        if (elm.text().indexOf('Bonusvoordeel') > -1) return false;

        if (elm.children().length != 4) return true;

        console.log();


        let name = cleanString($(elm.children()[0])?.text());
        let amount = cleanNumber($(elm.children()[1])?.text());
        let price = cleanNumber($(elm.children()[2])?.text());
        let total_price = cleanNumber($(elm.children()[3])?.text());

        if (name == null || amount == null || price == null || total_price == null) {
            console.error(`Name: ${name}, amount: ${amount}, price: ${price}, total price: ${total_price}`)
            return true;
        }

        if (isNaN(amount)) amount = 0;
        if (isNaN(price)) price = 0;
        if (isNaN(total_price)) total_price = 0;

        let product = new Product(name, amount, price, total_price, from);
        pakbon.addProduct(product);

        return true;
    });

    return pakbon;
}

const Parse = (from: string, body: string): Pakbon | null => {
    let $: cheerio.Root = Cheerio.load(body);

    return parseVersionOne(from, $);
};


const cleanString = (string: string | null | undefined): string | null => {
    if (string == null) return null;
    return string.replace(/\n/g, '').replace(/\s+/g, ' ').trim();
}

const cleanNumber = (string: string | null | undefined): number | null => {
    if (string == null) return null;

    return Math.round(Number.parseFloat(string.replace(/\n/g, '').replace(/\s+/g, ' ').trim()) * 100) / 100;
}

export {
    Parse
};
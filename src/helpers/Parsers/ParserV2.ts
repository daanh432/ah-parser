import { Pakbon } from "../../models/Pakbon";
import { Product, ProductStatus } from "../../models/Product";
import { Parser } from "./Parser";

type DataCacheType = {
    id: string | null;
    message: string | null;
    outofstock: cheerio.Cheerio;
    delivered: cheerio.Cheerio;
    bonus: cheerio.Cheerio;
}

const subjects = [
    "Je boodschappen komen eraan",
    "Je boodschappen zijn ingepakt. Helaas zijn niet alle producten leverbaar"
];

export class ParserV2 extends Parser {
    public static readonly INSTANCE: Parser = new ParserV2();

    private getData($: cheerio.Root): DataCacheType {
        return {
            id: this.cleanString($(
                'div[role=article] table > tbody > tr > td > table > tbody > tr:nth-child(3) > td:contains("Bestelnummer:")'
            )
                .text()
                ?.split(":")[2]
                ?.trim()),
            message: this.cleanString($('div[role=article] span > div > table:nth-child(1) > tbody > tr > td:contains("Bestelnummer")')
                .text()
                .trim()),
            outofstock: $(
                'div[role=article] > table > tbody > tr > td > div > table > tbody > tr:nth-child(1):contains("Niet leverbare producten")'
            )
                .parent()
                .find('tr:nth-child(2) > td > div > table > tbody > tr'),
            delivered: $(
                'div[role=article] > table > tbody > tr > td > div > table > tbody > tr:nth-child(1):contains("Wat zit er in jouw bestelling?")'
            )
                .parent()
                .find('tr:nth-child(2) > td > div > table > tbody > tr'),
            bonus: $(
                'div[role=article] > table > tbody > tr > td > div > table > tbody > tr:nth-child(1) > td  > div table:contains("Bonusvoordeel")'
            )
                .parent()
                .find('table:nth-child(2) > tbody > tr'),
        };
    }

    override canParse(from: string, subject: string, $: cheerio.Root): boolean {
        const data = this.getData($);
        if (data.id == null || data.message == null || data.delivered == null || data.outofstock == null) return false;
        return data.delivered.length > 0
            && subjects.find(sub => subject.toLowerCase().indexOf(sub.toLowerCase()) > -1) != null
    }

    override parse(from: string, subject: string, $: cheerio.Root): Pakbon | null {
        const data = this.getData($);

        if (data.id == undefined || data.message == undefined)
            return null;

        let pakbon = new Pakbon(null, from, data.id, data.message);


        const processProduct = (index: number, element: cheerio.Element, status: ProductStatus) => {
            let elm = $(element);

            let lcText = elm.text().toLowerCase();
            if (lcText.indexOf('boodschappen') > -1 && lcText.indexOf('aantal') > -1) return true;
            if (lcText.indexOf('boodschappen') > -1 && lcText.indexOf('totaal') > -1) return true;
            if (elm.children().length != 4) return true;

            let name = this.cleanString($(elm.children()[0])?.text());
            let amount = this.cleanNumber($(elm.children()[1])?.text());
            let price = this.cleanNumber($(elm.children()[2])?.text());
            let totalPrice = this.cleanNumber($(elm.children()[3])?.text());

            if (name == null || amount == null || price == null || totalPrice == null) {
                console.warn(`Could not parse product. Name: ${name}, amount: ${amount}, price: ${price}, total price: ${totalPrice}`)
                return true;
            }

            if (isNaN(amount)) amount = 0;
            if (isNaN(price)) price = 0;
            if (isNaN(totalPrice)) totalPrice = 0;

            let product = new Product(
                name,
                amount,
                price,
                totalPrice,
                from,
                status == ProductStatus.DELIVERED && totalPrice === 0 ? ProductStatus.FREE : status
            );

            pakbon.addProduct(product);

            return true;
        };

        data.delivered.each((index, element) => processProduct(index, element, ProductStatus.DELIVERED));
        data.outofstock.each((index, element) => processProduct(index, element, ProductStatus.OUT_OF_STOCK));

        return pakbon;
    }
}
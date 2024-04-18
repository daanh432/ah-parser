import { Pakbon } from "../../models/Pakbon";
import { Product, ProductStatus } from "../../models/Product";
import { Parser } from "./Parser";

export class ParserV1 extends Parser {
    public static readonly INSTANCE: Parser = new ParserV1();

    override canParse(from: string, subject: string, $: cheerio.Root): boolean {
        let id = $('table > tbody > tr > td > table:nth-child(6) > tbody > tr:nth-child(2) > td:nth-child(2) > strong').text()?.split(':')[1]?.trim();
        let message = this.cleanString($('table > tbody > tr > td > table:nth-child(6) > tbody > tr:nth-child(2) > td:nth-child(2)').contents()[5]?.data)

        let productsContainer = $('table > tbody > tr > td > table:nth-child(8) > tbody > tr:nth-child(1) > td:nth-child(1) > table:nth-child(1) > tbody > tr:nth-child(1) > td:nth-child(1) > table:nth-child(1) > tbody > tr');

        if (id == undefined || message == undefined || productsContainer == null)
            return false;

        return subject.indexOf('pakbon') > -1;
    }
    override parse(from: string, subject: string, $: cheerio.Root): Pakbon | null {

        let id = $('table > tbody > tr > td > table:nth-child(6) > tbody > tr:nth-child(2) > td:nth-child(2) > strong').text()?.split(':')[1]?.trim();
        let message = this.cleanString($('table > tbody > tr > td > table:nth-child(6) > tbody > tr:nth-child(2) > td:nth-child(2)').contents()[5]?.data)

        let productsContainer = $('table > tbody > tr > td > table:nth-child(8) > tbody > tr:nth-child(1) > td:nth-child(1) > table:nth-child(1) > tbody > tr:nth-child(1) > td:nth-child(1) > table:nth-child(1) > tbody > tr');

        if (id == undefined || message == undefined)
            return null;

        const timestamp = Math.round(new Date().getTime() / 1000);
        const pakbon = Pakbon.build({ from_email: from, order_number: id, message: message, date: timestamp });

        productsContainer.each((index, element) => {
            let elm = $(element);

            if (elm.text().indexOf('Prijs per stuk') > -1) return true;
            if (elm.text().indexOf('Bonusvoordeel') > -1) return false;

            if (elm.children().length != 4) return true;

            let name = this.cleanString($(elm.children()[0])?.text());
            let amount = this.cleanNumber($(elm.children()[1])?.text());
            let price = this.cleanNumber($(elm.children()[2])?.text());
            let total_price = this.cleanNumber($(elm.children()[3])?.text());

            if (name == null || amount == null || price == null || total_price == null) {
                console.error(`Name: ${name}, amount: ${amount}, price: ${price}, total price: ${total_price}`)
                return true;
            }

            if (isNaN(amount)) amount = 0;
            if (isNaN(price)) price = 0;
            if (isNaN(total_price)) total_price = 0;

            const product = Product.build({
                name,
                package_slip_id: -1,
                amount,
                price,
                total_price,
                status: ProductStatus.DELIVERED, checked: false,
            });

            pakbon.addProduct(product);

            return true;
        });

        return pakbon;
    }
}
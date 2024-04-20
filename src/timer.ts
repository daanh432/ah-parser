import { ImapListener } from './datasources/Imap';
import { Pakbon } from './models/Pakbon';
import { Product } from "./models/Product";

export const startTimer = () => {
    const imapListener = new ImapListener(process.env.IMAP_USER, process.env.IMAP_PASSWORD, process.env.IMAP_HOST, process.env.IMAP_PORT, process.env.IMAP_TLS === "true");
    const intervalInMinutes = 5;

    const searchPakbon = async () => {
        imapListener.searchMessages(async (pakbon: Pakbon) => {
            let searchPakbon = await Pakbon.findOne({ where: { order_number: pakbon.getOrderNumber() } });
            if (searchPakbon != null) return;

            const savedPakbon = await pakbon.save();
            pakbon.products.forEach(async (product) => {
                product.package_slip_id = savedPakbon.id;
            });
            await Product.bulkCreate(pakbon.getProducts());
        });
    }

    setInterval(() => {
        searchPakbon();
    }, intervalInMinutes * 60 * 1000);

    process.on('SIGHUP', () => {
        console.log('Received SIGHUP');
        searchPakbon();
    });
}
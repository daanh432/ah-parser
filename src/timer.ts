import { sequelize } from '.';
import { ImapListener } from './datasources/Imap';
import { Pakbon } from './models/Pakbon';

export const startTimer = () => {
    const imapListener = new ImapListener(process.env.IMAP_USER, process.env.IMAP_PASSWORD, process.env.IMAP_HOST, process.env.IMAP_PORT, process.env.IMAP_TLS === "true");
    const intervalInMinutes = 1;

    const searchPakbon = async () => {
        imapListener.searchMessages(async (pakbon: Pakbon) => {
            let searchPakbon = await Pakbon.findOne({ where: { order_number: pakbon.getOrderNumber() } });
            if (searchPakbon != null) return;

            await sequelize.transaction(async t => {
                const savedPakbon = await pakbon.save({ transaction: t });
                const products = await Promise.all(pakbon.getProducts()
                    .map(product => {
                        product.package_slip_id = savedPakbon.id;
                        product.package_slip = savedPakbon;
                        return product.save({ transaction: t });
                    }));
                return { pakbon: savedPakbon, products };
            });
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
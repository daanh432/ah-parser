import Imap, { Box, ImapFetch, ImapMessage } from 'imap';
import { MailParser } from 'mailparser';
import moment from 'moment';
import { Parse } from '../helpers/PakbonParser';
import { Pakbon } from '../models/Pakbon';

const markSeen: boolean = false;
const proccessedUids: number[] = [];

class ImapListener {
    private imap: Imap;

    constructor(user: string | undefined, password: string | undefined, host: string | undefined, port: string | undefined, tls: boolean) {
        if (user == undefined || password == undefined || host == undefined || port == undefined) {
            throw Error("Imap Listener details are required");
        }

        console.log(`User: ${user} Password: ${password} Host: ${host} Port: ${port} TLS: ${tls}`);

        this.imap = new Imap({
            user: user,
            password: password,
            host: host,
            port: Number.parseInt(port),
            tls: tls
        });

        this.imap.once('error', (error: Error) => {
            throw error;
        });
        
        this.imap.once('end', function() {
            throw Error("IMAP Disconnected");
        });
        
        this.imap.once('ready', () => {  
            this.openInbox((err: Error, box: Box) => {
                if (err) throw err;
            });
        });

        this.imap.connect();
    }

    private openInbox(cb: any) {
        this.imap.openBox('INBOX', !markSeen, cb);
    }

    public searchMessages(processedEmailHandler: (pakbon: Pakbon) => void) {
        if (this.imap.state === 'authenticated') {
            let date: string = moment().subtract(2, 'days').format('DD-MMM-YYYY');
            this.imap.search(["UNSEEN", ["SINCE", date], ["FROM", "gedariks@gmail.com"], ["SUBJECT", "Hier is je pakbon"]], (err, results) => {
                if (err) throw err;

                if (results.length > 0) {
                    let fetched: ImapFetch = this.imap.fetch(results, {bodies: ['HEADER', 'TEXT'], markSeen: markSeen});
    
                    fetched.on('message', (msg: ImapMessage, seqno: number) => {
                        if (proccessedUids.indexOf(seqno) > -1) return;
                        proccessedUids.push(seqno);
                        processMessage(msg, seqno).then(mail => {
                            processedEmailHandler(mail);
                        }).catch(error => {
                            console.warn(`(${seqno}) ` + error);
                        })
                    });
                }
            });
        } else {
            throw Error("IMAP is not authenticated");
        }
    }
}

function processMessage(msg: ImapMessage, seqno: number) {
    return new Promise<Pakbon>((resolve, reject) => {
        console.log("Processing msg #" + seqno);
        let body = '';
        let subject = '';
        let parser = new MailParser();
    
        parser.on('headers', headers => {
            if (headers.get('subject') != null) {
                subject = `${headers.get('subject')}`;
            }
        });
    
        parser.on('data', data => {
            if (data.type === 'text') {
                body += data.html;
            }
        });
    
        parser.on('end', () => {
            if (subject.indexOf("Hier is je pakbon") > -1) {
                let pakbon: Pakbon | null = Parse(body);
                if (pakbon != null) {
                    resolve(pakbon);
                } else {
                    reject("Provided mail was of invalid format");
                }
            } else {
                reject("Not an AH pakbon email");
            }
        });
    
        msg.on('body', (stream: any) => {
            stream.on("data", function(chunk: any) {
                parser.write(chunk.toString("utf8"));
            });
        });
    
        msg.once("end", function() {
            parser.end();
        });
    });
}

export { ImapListener }
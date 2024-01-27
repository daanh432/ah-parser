import Cheerio from "cheerio";
import {
    Pakbon
} from "../models/Pakbon";
import { ParserV1 } from "./Parsers/ParserV1";
import { ParserV2 } from "./Parsers/ParserV2";

const parsers = [
    ParserV1.INSTANCE,
    ParserV2.INSTANCE
];

export const Parse = (from: string, subject: string, body: string): Pakbon | null => {
    let $: cheerio.Root = Cheerio.load(body);

    for (let parser of parsers.reverse()) {
        if (parser.canParse(from, subject, $)) {
            return parser.parse(from, subject, $);
        }
    }

    console.warn(`No parser found for email from ${from}: ${subject}`);
    return null;
};
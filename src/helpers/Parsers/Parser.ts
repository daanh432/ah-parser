import { Pakbon } from "../../models/Pakbon";

export abstract class Parser {
    abstract canParse(from: string, subject: string, $: cheerio.Root): boolean;

    abstract parse(from: string, subject: string, $: cheerio.Root): Pakbon | null;

    protected cleanString(string: string | null | undefined): string | null {
        if (string == null) return null;
        return string.replace(/\n/g, '').replace(/\s+/g, ' ').trim();
    }

    protected cleanNumber(string: string | null | undefined): number | null {
        if (string == null) return null;

        return Math.round(Number.parseFloat(string.replace(/\n/g, '').replace(/\s+/g, ' ').trim()) * 100) / 100;
    }
}
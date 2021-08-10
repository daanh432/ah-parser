export default interface ImapFromHeader {
  html: string;
  text: string;
  value: { address: string; name: string }[];
}

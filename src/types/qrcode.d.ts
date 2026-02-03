declare module "qrcode" {
  export function toDataURL(text: string): Promise<string>;
  const QRCode: {
    toDataURL: (text: string) => Promise<string>;
  };
  export default QRCode;
}

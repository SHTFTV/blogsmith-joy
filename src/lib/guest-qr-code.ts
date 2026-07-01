import QRCode from "qrcode";

// Generates a QR code as a PNG data URL, pointing at the guest upload page.
export async function generateGuestQrCode(eventCode: string): Promise<string> {
  const url =
    typeof window !== "undefined"
      ? `${window.location.origin}/g/${eventCode}`
      : `https://weddings.io/g/${eventCode}`;
  return QRCode.toDataURL(url, {
    width: 512,
    margin: 2,
    color: { dark: "#000000", light: "#ffffff" },
  });
}

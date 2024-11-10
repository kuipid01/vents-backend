import { IEvent } from "@/api/events/eventModel";
import { Request } from "express";
import QRCode from "qrcode";
export async function generateQRCode(req:Request, event:IEvent) {
    try {
      // Get host and protocol from the request
      const host = req.get("host"); // e.g., localhost:3000 or yourdomain.com
      const protocol = req.protocol; // e.g., http or https
  
      // Generate the QR code URL dynamically
      const frontendUrl = `${protocol}://${host}/user/${event._id}/`;
  
      // Customize QR code options
      const options = {
        color: {
          dark: "#ff8f00", // Yellow QR code dots
          light: "#0000", // Transparent background
        },
      };
  
      // Generate QR code with custom colors
      const qrCodeDataURL = await QRCode.toDataURL(frontendUrl, options);
      return qrCodeDataURL;
    } catch (err) {
      console.error(err);
      throw new Error("Could not generate QR Code");
    }
  }
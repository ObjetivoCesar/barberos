import axios from "axios";

const EVOLUTION_API_URL = process.env.EVOLUTION_API_URL;

interface SendMessageParams {
  instance: string;
  apiKey: string;
  to: string;
  message: string;
}

export async function sendWhatsAppMessage({
  instance,
  apiKey,
  to,
  message,
}: SendMessageParams): Promise<void> {
  const url = `${EVOLUTION_API_URL}/message/sendText/${instance}`;
  const number = to.replace(/\D/g, "");

  try {
    await axios.post(
      url,
      {
        number,
        text: message,
        options: {
          delay: 1200,
        },
        textMessage: {
          text: message,
        },
      },
      {
        headers: {
          apikey: apiKey,
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error: any) {
    console.error("[Evolution API] Error sending WhatsApp message:", error);
    if (error.response?.data) {
      console.error("[Evolution API] Response data:", JSON.stringify(error.response.data, null, 2));
    }
    throw error;
  }
}

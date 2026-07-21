import axios from 'axios';

async function testWebhook() {
  const payload = {
    event: "messages.upsert",
    instance: "barberos-saas",
    data: {
      key: {
        remoteJid: "593963410409@s.whatsapp.net",
        fromMe: false
      },
      message: {
        conversation: "Hola, mi código de caja es RV55"
      },
      pushName: "Cesar Reyes"
    }
  };

  try {
    const res = await axios.post("https://barberos-rho-henna.vercel.app/api/webhook/whatsapp", payload);
    console.log("RESPONSE:", res.data);
  } catch (error) {
    console.error("ERROR:", error.response ? error.response.data : error.message);
  }
}
testWebhook();

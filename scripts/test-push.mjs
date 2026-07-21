import pkg from 'pg';
const { Client } = pkg;
import webpush from 'web-push';
import dotenv from 'dotenv';
dotenv.config();

const client = new Client({
  connectionString: 'postgresql://postgres.celkcsawwdvwnjfhjmkg:SZjmmmpjNYZvsyql@aws-1-us-west-2.pooler.supabase.com:6543/postgres?pgbouncer=true',
});

async function main() {
  await client.connect();
  const res = await client.query('SELECT endpoint, p256dh, auth FROM "PushSubscription" LIMIT 1');
  if (res.rows.length === 0) {
    console.log("No subscriptions found.");
    return;
  }
  
  const sub = res.rows[0];
  console.log("Found subscription for endpoint:", sub.endpoint);

  const email = process.env.VAPID_EMAIL || "mailto:admin@barberos.app";
  const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  const privateKey = process.env.VAPID_PRIVATE_KEY;

  if (!publicKey || !privateKey) {
    console.error("Missing VAPID keys in .env");
    return;
  }

  webpush.setVapidDetails(email, publicKey, privateKey);

  const pushSubscription = {
    endpoint: sub.endpoint,
    keys: {
      p256dh: sub.p256dh,
      auth: sub.auth
    }
  };

  try {
    const response = await webpush.sendNotification(
      pushSubscription,
      JSON.stringify({ title: "TEST", body: "Este es un mensaje de prueba PWA", url: "/panel" })
    );
    console.log("Push sent successfully!", response.statusCode);
  } catch (error) {
    console.error("Error sending push:", error);
  }

  await client.end();
}

main().catch(console.error);

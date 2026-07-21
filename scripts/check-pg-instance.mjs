import pkg from 'pg';
const { Client } = pkg;

const client = new Client({
  connectionString: 'postgresql://postgres.celkcsawwdvwnjfhjmkg:SZjmmmpjNYZvsyql@aws-1-us-west-2.pooler.supabase.com:6543/postgres?pgbouncer=true',
});

async function main() {
  await client.connect();
  const res = await client.query('SELECT id, "evolutionInstance", "evolutionApiKey" FROM "Barbershop"');
  console.log("BARBERSHOPS:");
  console.table(res.rows);
  await client.end();
}

main().catch(console.error);

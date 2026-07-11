const cron = require('node-cron');
const { discoverLeads } = require('./discover');

cron.schedule(process.env.CRON_SCHEDULE || '0 8 * * 1', async () => {
  console.log(`[${new Date().toISOString()}] Lead discovery starting...`);
  try {
    const count = await discoverLeads();
    console.log(`[${new Date().toISOString()}] Done. ${count} new leads inserted.`);
  } catch (err) {
    console.error(`[${new Date().toISOString()}] Error:`, err.message);
  }
});

console.log('[worker] M4D lead discovery cron started');

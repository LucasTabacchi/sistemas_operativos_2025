// OrdersService (Publisher)
import amqplib from 'amqplib';

const AMQP_URL = process.env.AMQP_URL || 'amqp://rabbitmq';
const QUEUE = 'orders.created';

function randomOrder() {
  const orderId = `ORD-${Math.floor(Math.random() * 10000)}`;
  const customers = ["ana@example.com", "juan@example.com", "sofia@example.com", "lucas@example.com"];
  const customerEmail = customers[Math.floor(Math.random() * customers.length)];

  const total = (Math.random() * 1000).toFixed(2); // entre 0 y 1000
  const allItems = [
    { sku: "SKU-ABC", qty: Math.ceil(Math.random() * 5) },
    { sku: "SKU-XYZ", qty: Math.ceil(Math.random() * 3) },
    { sku: "SKU-123", qty: Math.ceil(Math.random() * 4) }
  ];

  // selecciona aleatoriamente 1 o más items
  const items = allItems.slice(0, Math.ceil(Math.random() * allItems.length));

  return {
    type: "OrderCreated",
    orderId,
    customerEmail,
    total: parseFloat(total),
    items
  };
}

async function connectWithRetry(retries = 10, delayMs = 2000) {
  for (let i = 1; i <= retries; i++) {
    try {
      console.log(`[AMQP] Intento ${i}/${retries} de conexión...`);
      const conn = await amqplib.connect(AMQP_URL);
      console.log('[AMQP] Conexión establecida ✅');
      return conn;
    } catch (err) {
      console.error(`[AMQP] Falló intento ${i}: ${err.code || err.message}`);
      if (i === retries) throw err;
      await new Promise(r => setTimeout(r, delayMs));
    }
  }
}

async function run() {
  const conn = await connectWithRetry();
  const ch = await conn.createChannel();

  await ch.assertQueue(QUEUE, { durable: false, exclusive: false, autoDelete: false });

  // Publicamos varios pedidos aleatorios
  for (let i = 1; i <= 10; i++) {
    const order = randomOrder();
    ch.sendToQueue(QUEUE, Buffer.from(JSON.stringify(order)), { contentType: 'application/json' });
    console.log(`[OrdersService] Publicado OrderCreated: ${JSON.stringify(order)}`);
    await new Promise(r => setTimeout(r, 1000)); // espera 1 segundo entre pedidos
  }

  console.log('Presiona Enter para salir...');
  const cleanExit = async () => { try { await ch.close(); } catch {} try { await conn.close(); } catch {} process.exit(0); };
  process.stdin.resume();
  process.stdin.on('data', cleanExit);
  process.on('SIGINT', cleanExit);
  process.on('SIGTERM', cleanExit);
}

run().catch(err => { console.error(err); process.exit(1); });

// NotificationService (Consumer)
import amqplib from 'amqplib';
import nodemailer from 'nodemailer';

const AMQP_URL = process.env.AMQP_URL || 'amqp://rabbitmq';
const QUEUE = 'orders.created';

// SMTP apuntando a MailHog (para ver emails en http://localhost:8025)
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'mailhog',
  port: Number(process.env.SMTP_PORT || 1025),
  secure: false
});

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

  await ch.consume(
    QUEUE,
    async (msg) => {
      if (!msg) return;
      try {
        const payload = JSON.parse(msg.content.toString());
        console.log(`[NotificationService] Order recibido: ${JSON.stringify(payload)}`);

        // Enviar “correo”
        const info = await transporter.sendMail({
          from: process.env.SMTP_FROM || 'no-reply@mi-tienda.test',
          to: payload.customerEmail,
          subject: `Pedido ${payload.orderId} creado`,
          text: `¡Hola! Tu pedido ${payload.orderId} fue creado por un total de $${payload.total}.`,
        });

        console.log(`[NotificationService] Email enviado -> ${info.messageId || '(capturado por MailHog)'}`);
        // noAck: true => no hace falta ack manual
      } catch (e) {
        console.error('[NotificationService] Error procesando mensaje:', e);
      }
    },
    { noAck: true }
  );

  console.log('Esperando pedidos. Presiona Enter para salir...');
  const cleanExit = async () => { try { await ch.close(); } catch {} try { await conn.close(); } catch {} process.exit(0); };
  process.stdin.resume();
  process.stdin.on('data', cleanExit);
  process.on('SIGINT', cleanExit);
  process.on('SIGTERM', cleanExit);
}

run().catch(err => { console.error(err); process.exit(1); });

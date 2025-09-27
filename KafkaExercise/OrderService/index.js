// OrderService (Producer): genera los eventos de negocio (estado de pedidos).
// OrderService/index.js
const { Kafka } = require('kafkajs');

(async () => {
  const kafka = new Kafka({ clientId: 'order-service', brokers: ['kafka:9092'] });
  const producer = kafka.producer();

  await producer.connect();

  const send = async (orderId, status) => {
    const event = { orderId, status, timestamp: new Date().toISOString() };
    await producer.send({ topic: 'orders.status', messages: [{ value: JSON.stringify(event) }] });
    console.log(`[OrderService] Evento publicado: ${JSON.stringify(event)}`);
  };

  await send(1, 'CREADO');
  await new Promise(r => setTimeout(r, 800));
  await send(1, 'CONFIRMADO');
  await new Promise(r => setTimeout(r, 800));
  await send(1, 'ENVIADO');

  await producer.disconnect();
  process.exit(0);
})();


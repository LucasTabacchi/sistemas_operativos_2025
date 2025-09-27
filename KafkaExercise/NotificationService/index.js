// NotificationService (Consumer): escucha esos eventos y “notifica” (ejemplo: mostrar por consola o enviar mails en un caso real).
const { Kafka } = require('kafkajs');

const kafka = new Kafka({ clientId: 'notification-service', brokers: ['kafka:9092'] });
const consumer = kafka.consumer({ groupId: 'notification-group' });

async function run() {
  await consumer.connect();
  await consumer.subscribe({ topic: 'orders.status', fromBeginning: true });

  await consumer.run({
    eachMessage: async ({ message }) => {
      const event = JSON.parse(message.value.toString());
      console.log(`[NotificationService] Notificando cambio: Pedido ${event.orderId} → ${event.status}`);
    },
  });
}

run().catch(console.error);

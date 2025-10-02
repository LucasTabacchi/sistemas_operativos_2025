// AnalyticsService (Consumer): escucha los mismos eventos pero para registrar estadísticas.
const { Kafka } = require('kafkajs');

const kafka = new Kafka({ clientId: 'analytics-service', brokers: ['kafka:9092'] });
const consumer = kafka.consumer({ groupId: 'analytics-group' });

async function run() {
  await consumer.connect();
  await consumer.subscribe({ topic: 'orders.status', fromBeginning: true });

  await consumer.run({
    eachMessage: async ({ message }) => {
      const event = JSON.parse(message.value.toString());
      console.log(`[AnalyticsService] Registrando evento: ${JSON.stringify(event)}`);
    },
  });
}

run().catch(console.error);

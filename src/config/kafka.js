const { Kafka } = require('kafkajs');

const kafka = new Kafka({
    clientId: 'polling-app',
    brokers: ['localhost:9092'],
    retry: {
        initialRetryTime: 100,
        retries: 8
    }
});

const producer = kafka.producer();
const consumer = kafka.consumer({ groupId: 'polling-group' });

async function initKafka() {
    try {
        await producer.connect();
        await consumer.connect();
        // Remove the subscribe here since it's handled in KafkaConsumerService
        console.log('Kafka connected successfully');
    } catch (error) {
        console.error('Kafka connection failed:', error);
        throw error;
    }
}

module.exports = {
    producer,
    consumer,
    initKafka
};
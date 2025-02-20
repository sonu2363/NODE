const { Kafka } = require('kafkajs');

class KafkaProducer {
    constructor() {
        this.kafka = new Kafka({
            clientId: 'polling-producer',
            brokers: ['localhost:9092'],
            retry: {
                initialRetryTime: 100,
                retries: 8
            }
        });

        this.producer = this.kafka.producer();
    }

    async connect() {
        try {
            await this.producer.connect();
            console.log('Producer connected successfully');
        } catch (error) {
            console.error('Producer connection failed:', error);
            throw error;
        }
    }

    async sendVote(pollId, optionId) {
        try {
            await this.producer.send({
                topic: 'votes',
                messages: [{
                    key: pollId,
                    value: JSON.stringify({
                        pollId,
                        optionId,
                        timestamp: new Date().toISOString()
                    })
                }]
            });
            console.log(`Vote sent for poll ${pollId}, option ${optionId}`);
        } catch (error) {
            console.error('Failed to send vote:', error);
            throw error;
        }
    }

    async disconnect() {
        try {
            await this.producer.disconnect();
            console.log('Producer disconnected successfully');
        } catch (error) {
            console.error('Producer disconnection failed:', error);
            throw error;
        }
    }
}

module.exports = KafkaProducer;
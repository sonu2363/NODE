const { consumer } = require('../config/kafka');
const PollOption = require('../models/PollOption');
const Poll = require('../models/Poll');
const { sequelize } = require('../config/db');

class KafkaConsumerService {
    constructor(wsManager) {
        this.wsManager = wsManager;
    }

    async start() {
        try {
            await consumer.run({
                eachMessage: async ({ topic, partition, message }) => {
                    await this.processVote(JSON.parse(message.value.toString()));
                }
            });
            console.log('Kafka consumer started successfully');
        } catch (error) {
            console.error('Kafka consumer error:', error);
            throw error;
        }
    }

    async processVote({ pollId, optionId }) {
        const transaction = await sequelize.transaction();

        try {
            // Update vote count atomically
            await PollOption.increment('votes', {
                where: { id: optionId },
                transaction
            });

            // Get updated poll data
            const updatedPoll = await Poll.findByPk(pollId, {
                include: [PollOption],
                transaction
            });

            await transaction.commit();

            // Broadcast update to connected clients
            this.wsManager.broadcast(pollId, {
                type: 'VOTE_UPDATE',
                data: updatedPoll
            });

            // Trigger leaderboard update
            await this.updateLeaderboard();
        } catch (error) {
            await transaction.rollback();
            console.error('Vote processing error:', error);
            throw error;
        }
    }

    async updateLeaderboard() {
        try {
            const topOptions = await PollOption.findAll({
                include: [Poll],
                order: [['votes', 'DESC']],
                limit: 10
            });

            this.wsManager.broadcast('leaderboard', {
                type: 'LEADERBOARD_UPDATE',
                data: topOptions
            });
        } catch (error) {
            console.error('Leaderboard update error:', error);
        }
    }
}

module.exports = KafkaConsumerService;
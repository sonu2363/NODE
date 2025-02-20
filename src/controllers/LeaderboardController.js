const PollOption = require('../models/PollOption');
const Poll = require('../models/Poll');

class LeaderboardController {
    constructor(wsManager) {
        this.wsManager = wsManager;
    }

    async getLeaderboard(req, res) {
        try {
            const topOptions = await PollOption.findAll({
                include: [Poll],
                order: [['votes', 'DESC']],
                limit: 10
            });

            res.json({
                timestamp: new Date(),
                leaderboard: topOptions
            });
        } catch (error) {
            console.error('Leaderboard error:', error);
            res.status(500).json({ error: 'Failed to fetch leaderboard' });
        }
    }
}

module.exports = LeaderboardController;
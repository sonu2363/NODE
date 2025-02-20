const express = require('express');
const LeaderboardController = require('../controllers/LeaderboardController');

function createLeaderboardRouter(wsManager) {
    const router = express.Router();
    const leaderboardController = new LeaderboardController(wsManager);

    router.get('/', (req, res) => leaderboardController.getLeaderboard(req, res));

    return router;
}

module.exports = createLeaderboardRouter;
const express = require('express');
const PollController = require('../controllers/PollController');

function createPollRouter(wsManager) {
    const router = express.Router();
    const pollController = new PollController(wsManager);

    router.post('/', (req, res) => pollController.createPoll(req, res));
    router.post('/:pollId/vote/:optionId', (req, res) => pollController.vote(req, res));
    router.get('/:id', (req, res) => pollController.getPoll(req, res));

    return router;
}

module.exports = createPollRouter;
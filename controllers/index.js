const express = require(`express`);
const router = express.Router();

const userRoutes = require(`./userRoutes`)
router.use(`/api/users`,userRoutes);

const messageRoutes = require(`./messageRoutes`)
router.use(`/api/messages`,messageRoutes);

const conversationRoutes = require(`./conversationRoutes`)
router.use(`/api/conversations`,conversationRoutes);

const htmlRoutes = require(`./htmlRoutes`)
router.use(`/`, htmlRoutes);

module.exports = router;
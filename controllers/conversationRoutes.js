const express = require('express');
const router = express.Router();
const { Message, Conversation, User, UsersConversations } = require('../models'); // Imports the Message and Conversation model
const userAuth = require(`../middleware/userAuth`); //Imports user authentication middlewear
const sequelize = require('../config/connection');
const { Sequelize } = require('sequelize');

// GET all conversations
router.get(`/`, (req, res) => {
    Conversation.findAll().then(dbConversation => {
        res.json(dbConversation);
    }).catch(err => {
        res.status(500).json({ msg: `Server Error!`, err });
    })
})

// GET all conversations user owns
router.get(`/owner/`, (req, res) => {
    Conversation.findAll({
        where: {
            ownerId: req.session.user.id
        }
    }).then(dbConversation => {
        res.json(dbConversation);
    }).catch(err => {
        res.status(500).json({ msg: `Server Error!`, err });
    })
})

// GET all conversations user is in
router.get(`/isin/`, (req, res) => {
    const userId = req.session.user.id
    User.findByPk(userId)
        .then(user => {
            if (!user) {
                return res.status(404).json({ msg: 'User not found' });
            }

            return Conversation.findAll({
                include: [
                    {
                        model: User,
                        as: 'Participants',
                        where: { id: userId }, // Filter by user ID
                        through: 'UsersConversations' // Use the correct name of the junction table
                    }
                ]
            });
        }).then(dbConversation => {
            res.json(dbConversation);
        }).catch(err => {
            res.status(500).json({ msg: `Server Error!`, err });
        })
});

// GET one Conversation
router.get(`/:id`, (req, res) => {
    Conversation.findByPk(req.params.id, {
        include: [User]
    }).then(dbConversation => {
        if (!dbConversation) {
            return res.status(404).json(`No Conversation exists!`)
        }
        res.json(dbConversation)
    }).catch(err => {
        res.status(500).json({ msg: `Server Error!`, err });
        console.log(err);
    })
})

// CREATE new Conversation
router.post(`/`, userAuth, (req, res) => {
    Conversation.create({
        ownerId: req.session.user.id,
        conversation_name: req.body.conversation_name
    }).then(dbConversations => {
        res.json(dbConversations)
    }).catch(err => {
        res.status(500).json({ msg: `Server error!`, err });
    })
});

// DELETE conversation
router.delete(`/:id`, userAuth, (req, res) => {
    Conversation.destroy({
        where: {
            id: req.params.id
        }
    }).then(dbConversation => {
        res.json(dbConversation)
    }).catch(err => {
        res.status(500).json({ msg: `Server error!`, err })
    })
});

// ADD user to conversation
router.post(`/addUser`, (req, res) => {
    User.findOne({
        where: {username: req.body.username}
    }).then(dbUser => {
            if (!dbUser) {
                return res.status(404).json({ msg: `User not found` });
            }
            return Conversation.findByPk(req.body.conversationId)
                .then(dbConversation => {
                    if (!dbConversation) {
                        return res.status(404).json({ msg: `Conversation not found` });
                    }
                    return dbConversation.addParticipant(dbUser)
                        .then(()=> {
                            res.json({msg: `User added to conversation`})
                        })
                })
        }).catch(err => {
            console.error(err);
            res.status(500).json({msg: `Server error`, err});
        })
})

module.exports = router;
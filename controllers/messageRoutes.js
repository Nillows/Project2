const express = require('express');
const router = express.Router();
const { Message, User } = require('../models'); // Imports the Message model
const userAuth = require(`../middleware/userAuth`); //Imports user authentication middlewear

// GET all messages
router.get(`/`,(req,res) => {
    Message.findAll().then(dbMessage => {
        res.json(dbMessage);
    }).catch(err => {
        res.status(500).json({msg:`Server Error!`, err});
    })
})

// GET all messages for given conversation
router.get(`/inconvo/:id`, (req,res) => {
    Message.findAll({
        where: {
            conversationId: req.params.id
        },
        include:[{
            model: User,
            attributes: [`username`],
        }]
    }).then(dbConversation => {
        const userId = req.session.user.id
        console.log(userId)
        res.json({dbConversation,userId});
    }).catch(err => {
        res.status(500).json({msg:`Server Error!`, err});
    })
})

// GET one message
router.get(`/:id`,(req,res) => {
    Message.findByPk(req.params.id,{
        include:[User]
    }).then(dbMessage => {
       if(!dbMessage) {
        return res.status(404).json(`No message exists!`)
       }
       res.json(dbMessage)
    }).catch(err => {
        res.status(500).json({msg:`Server Error!`, err});
        console.log(err);
    })
})

// CREATE new message
router.post(`/`,(req,res) => {
    Message.create({
        content:req.body.content,
        userId:req.session.user.id,
        conversationId:req.body.conversation_id,
        nice_date: req.body.nice_date
    }).then(dbMessages => {
        res.json(dbMessages)
    }).catch(err => {
        res.status(500).json({msg:`Server error!`,err});
    })
});

// DELETE message
router.delete(`/:id`, userAuth, (req,res) => {
    Message.destroy({
        where: {
            id:req.params.id
        }
    }).then(dbMessage => {
        res.json(dbMessage)
    }).catch(err => {
        res.status(500).json({msg:`Server error!`,err})
    })
});

module.exports = router;
const express = require('express');
const router = express.Router();
const { Conversation, Message, User, Friend } = require("../models");

router.get("/",  (req,res)=>{
    if(!req.session.user) {
        console.log(req.session.user)
        const imageUrl = `../img/logo.png`
        res.render("landing_page", {imageUrl});
    } else {
        imageUrl = `../img/logo.png`
        res.render("chat_room_page", {imageUrl});
    }
})

router.get("/login",(req,res)=>{
    const imageUrl = `../img/logo.png`
    res.render("login_page", {imageUrl});
})

router.get('/conversations',(req,res)=>{
    res.render("chat_room_page");
})

router.get('/registration',(req,res)=>{
    const imageUrl = `../img/logo.png`
    res.render("registration_page", {imageUrl});
})

// POST route for '/room'
router.post('/room', (req, res) => {
    const roomName = req.body.room;
    // Check if the room already exists or create a new room
    // placeholder for your room creation logic
   

    //redirect to the room page
    res.redirect(`/room/${roomName}`);
});

// Route for displaying a specific chat room
router.get('/room/:roomName', (req, res) => {
    // Extract the room name from the URL parameter
    const roomName = req.params.roomName;

    // Render the 'rooms' template, passing the room name to the template
    res.render('room', { roomName: roomName });
});


module.exports = router;

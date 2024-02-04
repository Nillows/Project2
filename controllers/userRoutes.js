const express = require('express');
const router = express.Router();
const bcrypt = require(`bcrypt`);
const { User } = require('../models'); // Imports the User model

// GET all users for homepage
router.get('/', async (req, res) => {
  try {
    const dbUserData = await User.findAll({
      // any additional queries options go here
    });

    const users = dbUserData.map((user) =>
      user.get({ plain: true })
    );
    res.json(dbUserData);
    // Send over the 'loggedIn' session variable to the 'homepage' template
    // res.render('homepage', {
    //   users,
    //   loggedIn: req.session.loggedIn,
    // });
  } catch (err) {
    console.log(err);
    res.status(500).json(err);
  }
});

// GET one user by ID
router.get('/:id', async (req, res) => {
  try {
    const dbUserData = await User.findByPk(req.params.id);
    if (!dbUserData) {
      res.status(404).json({ message: 'No user found with this id!' });
      return;
    }

    const user = dbUserData.get({ plain: true });
    res.json(dbUserData);
    // Send over the 'loggedIn' session variable to the 'user' template   TODO MAKE SURE THE USER TEMPLATE HAS A loggedIn variable
    // res.render('user', { user, loggedIn: req.session.loggedIn });
  } catch (err) {
    console.log(err);
    res.status(500).json(err);
  }
});

// CREATE new user
router.post(`/`,(req,res) => {
  console.log(req.body);
  User.create({
    username:req.body.username,
    email:req.body.email,
    password:req.body.password,
    name:req.body.name
  }).then(newUser=>{
    req.session.user = {
      id:newUser.id
    }
    res.json(newUser)
  }).catch(err=>{
    res.status(500).json({msg:`Server Error!`,err});
  })
});

// POST route for user login
router.post('/login', async (req, res) => {
    try {
        const foundUser = await User.findOne({
            where: {
                username: req.body.username, // Assuming username is used for login
            }
        });

        if (!foundUser) {
            return res.status(401).json({ message: 'Incorrect username or password!' });
        } else if (!foundUser.checkPassword(req.body.password)) {
            return res.status(401).json({ message: 'Incorrect username or password!' });
        }

        req.session.user = {
            id: foundUser.id,
            username: foundUser.username
        };

        res.json({userId: req.session.user.id, username: req.session.user.username});
    } catch (err) {
        console.log(err);
        res.status(500).json(err);
    }
});
  
// POST route for user logout
router.delete('/logout', (req, res) => {
  if (req.session) {
    req.session.destroy((err) => {
      if (err) {
        // error case
        console.error('asychnronous session destruction occured', err);
        res.status(500).json({ message: 'Error during logout' });
      } else {
        // logout successful
        res.status(200).json({ message: 'Logout Successful' });
      }
    });
  } else {
    // session timeout case
    res.status(404).json({ message: 'No active session found' });
  }
});
  
  module.exports = router;

const {Message} = require(`../models`);
const isMyMessage = (req,res,next) => {
    Message.findByPk(req.params.id).then(foundMessage => {
        if(foundMessage.userId!==req.session.user.id) {
            return res.status(401).json({msg:`Not your message!`})
        }
        next()
    })
}

module.exports = isMyMessage
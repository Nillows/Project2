const userAuth = (req,res,next) => {
    if(!req.session.user?.id) {
        return res.status(401).json({msg:`Login first!`})
    }
    next()
}

module.exports = userAuth
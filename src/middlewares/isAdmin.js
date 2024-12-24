async function isAdmin(req, res, next){
    const { role } = req.user;
    if(role === 'admin' ){
        return next();
    }
    return res.status(403).json({ success: false, message: "Access denied, Admin only." });
}
module.exports = isAdmin;
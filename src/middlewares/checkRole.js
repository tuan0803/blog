const  checkRole = (requireRole) =>{
    return (req, res, next) => {
        try {
            const { role } = req.user;
            if(requireRole && role !== requireRole){
                return res.status(403).json({ success: false, message: 'You do not have permission to access this resource.' });
            }
            next();
        } catch (error) {
            return res.status(401).json({ success: false, message: 'Invalid or expired token.' });
        }
        
    }
}

const isAdmin = checkRole( 'admin' );
const isUser = checkRole( 'user' );


module.exports = { isAdmin, isUser };
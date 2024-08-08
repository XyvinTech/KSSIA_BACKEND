
function rolesGuard(req, res, next,role) {
    if(!req.user) return res.status(401).json({ message: 'Unauthorized' })
		
	const userPermission = req.user.role.permissions
	if(userPermission.includes(role)) return next()
    return res.status(401).json({ message: 'Unauthorized' });
}
module.exports = rolesGuard;
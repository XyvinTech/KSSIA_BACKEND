
function rolesGuard(permissionName) {
	return (req,res,next)=>{

		if(!req.user) return res.status(401).json({ message: 'Unauthorized' })
			
		const userPermissions = Object.values(req.user.role.permissions)
		const hasPermission = userPermissions.some(
			(permission) => permission.name === permissionName && permission.value
		  );
		
		if(hasPermission) return next()
		return res.status(401).json({ message: 'Unauthorized' });
	}
}
module.exports = rolesGuard;
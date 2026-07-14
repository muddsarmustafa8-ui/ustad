const { ROLES } = require('../config/constants');

const isAdmin = (req, res, next) => {
  if (req.user && [ROLES.SUPER_ADMIN, ROLES.ADMIN].includes(req.user.role)) {
    return next();
  }
  return res.status(403).json({ success: false, message: 'Admin access required' });
};

const isModeratorOrAdmin = (req, res, next) => {
  if (req.user && [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.MODERATOR].includes(req.user.role)) {
    return next();
  }
  return res.status(403).json({ success: false, message: 'Admin or Moderator access required' });
};

module.exports = {
  isAdmin,
  isModeratorOrAdmin,
};

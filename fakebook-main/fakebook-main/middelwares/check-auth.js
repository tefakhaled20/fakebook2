function checkAuthStatus(req, res, next) {
    const uid = req.session.uid;
  
    if (!uid) {
      return next();
    }
  
    res.locals.isAuth = req.session.uid ? true : false;
    next();
  }
  
  module.exports = checkAuthStatus;
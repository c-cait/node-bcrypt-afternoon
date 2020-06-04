module.exports = {
    usersOnly: (req, res, next) => {
        //this check id there is a user object on req.session
        //top level middleware that ensures each endpoint requires a user to be logged in
        //so now instead of getting an error in the console, we will respond with an error to the client
      if (!req.session.user) {
        return res.status(401).send('Please log in');
      }
      next();
    },
    adminsOnly: (req, res, next) => {
        if (!req.session.user.isAdmin) {
          return res.status(403).send('You are not an admin');
        }
        next();
      }
  };
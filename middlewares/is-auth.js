module.exports = (req, res, next) => {

  if(!req.session.isLoggedIn) {
    console.log(`${req.method}: Access to ${req.url} unauthorized.`);
    return res.status(200).redirect('/login');
  }

  next();
}

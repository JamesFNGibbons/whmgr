const router = require('express').Router();

router.get('/logout', (req, res) => {
  if(req.session.loggedin){
    req.session.loggedin = false;
    req.session.client_loggedin = false;
  }

  res.redirect('/');
});

module.exports = router;

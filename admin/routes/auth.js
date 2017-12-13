const router = require('express').Router();

router.get('/client-logout', (req, res) => {
	if(req.session.client_loggedin){
		req.session.client_loggedin = false;
		res.redirect('/');
	}
});

router.get('/logout', (req, res) => {
  if(req.session.loggedin){
    req.session.loggedin = false;
    req.session.client_loggedin = false;
  }

  res.redirect('/');
});

module.exports = router;

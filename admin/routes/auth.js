const router = require('express').Router();

router.get('/client-logout', (req, res) => {
	if(req.session.client_loggedin){
		req.session.client_loggedin = false;
		res.redirect('/');
	}
});

/**
  * Route used to change the clients
  * accodunt to another one.
*/
router.post('/change-client', (req, res) => {
	if(req.session.loggedin){
		let account = req.body.account;
		req.session.client_username = account;
		res.redirect('/clientarea');
	}
	else{
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

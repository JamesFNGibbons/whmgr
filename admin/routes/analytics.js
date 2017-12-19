const router = require('express').Router();
const whmgr = require('./../whmgr');

/**
  * Route used to display an overview
  * of the analytics of the given site.
*/
router.get('/', (req, res) => {
	if(req.session.client_loggedin){
		let analytics = new whmgr.Analytics(req.session.client_username);
		analytics.get_all((views) => {
			req.db.collection('accounts').find({
				username: req.session.client_username
			}).toArray((err, account) => {
				if(err) throw err;
				else{
					account = account[0];

					// Get todays views. 
					analytics.get_today((today_views) => {
						res.render('analytics/overview', {
							title: "Analytics Overview",
							views: views,
							today_views: today_views,
							account: account
						});
					});
				}
			});
		});
	}	
	else{
		res.redirect('/');
	}
});

module.exports = router;
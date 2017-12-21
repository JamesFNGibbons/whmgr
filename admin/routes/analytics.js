const router = require('express').Router();
const whmgr = require('./../whmgr');

/**
  * Route used to notify the user that
  * there is no analytics to display.
*/
router.get('/none', (req, res) => {
	if(req.session.client_loggedin){
		// Redirect the user if they have analytics
		let analytics = new whmgr.Analytics(req.session.client_username);
		analytics.has_analytics((has_analytics) => {
			if(has_analytics){
				res.redirect('/clientarea/analytics');
			}
			else{
				res.render('analytics/none', {
					title: "No Analytics",
				});
			}
		});
	}
	else{
		res.redirect('/');
	}
});

/**
  * Route used to display an overview
  * of the analytics of the given site.
*/
router.get('/', (req, res) => {
	if(req.session.client_loggedin){
		let analytics = new whmgr.Analytics(req.session.client_username);

		// Check if the user has any stored analytics.
		analytics.has_analytics((has_analytics) => {
			if(has_analytics){
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
				res.redirect('/clientarea/analytics/none');
			}
		})
	}	
	else{
		res.redirect('/');
	}
});

module.exports = router;
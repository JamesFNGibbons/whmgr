const router = require('express').Router();
const fs = require('fs');

/**
  * Route used to display the php
  * error log for the client.
*/
router.get('/php-errors', (req, res) => {
	if(req.session.client_loggedin){
		let log_location = `/home/${req.session.client_username}/logs/error.log`;
		if(fs.existsSync(log_location)){
			fs.readFile(log_location, (err, log) => {
				// Replace the line breaks with html <br> tags
				let the_log = log.toString().replace(/(?:\r\n|\r|\n)/g, '<br><br>');

				res.render('logs/php', {
						title: "Php Access Log",
						the_log: the_log
					});
			})
		}
		else{
			res.render('logs/access', {
				title: "Php Access Log",
				no_log: true
			});
		}
	}
	else{
		res.redirect('/');
	}
});

/**
  * Route used to display the apache2
  * access log for the client.
*/
router.get('/apache-access', (req, res) => {
	if(req.session.client_loggedin){
		let log_location = `/home/${req.session.client_username}/logs/access.log`;
		if(fs.existsSync(log_location)){
			fs.readFile(log_location, (err, log) => {
				// Replace the line breaks with html <br> tags
				let the_log = log.toString().replace(/(?:\r\n|\r|\n)/g, '<br><br>');

				res.render('logs/access', {
						title: "Apache Access Log",
						the_log: the_log
					});
			})
		}
		else{
			res.render('logs/access', {
				title: "Apache Access Log",
				no_log: true
			});
		}
	}
	else{
		res.redirect('/');
	}
});

module.exports = router;
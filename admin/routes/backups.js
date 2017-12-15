const router = require('express').Router();
const fs = require('fs');

/**
  * Route used to list the current
  * backups.
*/
router.get('/', (req, res) => {
	if(req.session.client_loggedin){
		let backups_dir = `/home/${req.session.client_username}/backups`;
		// Create the users backups dir is it does not exist.
		if(!fs.existsSync(backups_dir)){
			fs.mkdir(backups_dir);
		}

		res.render('backups/list', {
			title: "Backups",
			backups: fs.readdirSync(backups_dir)
		});
	}
	else{
		res.redirect('/');
	}
});

module.exports = router;
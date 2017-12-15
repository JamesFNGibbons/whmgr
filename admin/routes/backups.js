const router = require('express').Router();
const fs = require('fs');
const exec = require('child_process').exec;

/**
  * Route used to restore a given
  * backup.
*/
router.post('/restore', (req, res) => {
	if(req.session.client_loggedin){
		let account = req.session.client_username;
		let backup = req.body.backup;

		exec(`sudo bash /usr/local/whmgr/scripts/restore-backup.sh ${account} ${backup}`, (err) => {
			if(err) throw err;
			else{
				res.redirect('/clientarea/backups?backup_restored=true');
			}
		});
	}
	else{
		res.redirect('/');
	}
});

/**
  * Route used to delete a backup/
*/
router.post('/delete', (req, res) => {
	if(req.session.client_loggedin){
		let account = req.session.client_username;
		let backup = req.body.backup;

		exec(`sudo bash /usr/local/whmgr/scripts/delete-backup.sh ${account} ${backup}`, (err) => {
			if(err) throw err;
			else{
				res.redirect('/clientarea/backups?backup_deleted=true');
			}
		});
	}
	else{
		res.redirect('/');
	}
});

/**
  * Route used to create a new backup.
*/
router.get('/do-backup', (req, res) => {
	if(req.session.client_loggedin){
		let account = req.session.client_username;
		exec(`sudo bash /usr/local/whmgr/scripts/backup.sh ${account}`, (err) => {
			if(err) throw err;
			else{
				res.redirect('/clientarea/backups');
			}
		});
	}
	else{
		res.redirect('/');
	}
});

/**
  * Route used to list the current
  * backups.
*/
router.get('/', (req, res) => {
	if(req.session.client_loggedin){
		let backups_dir = `/home/${req.session.client_username}/backups`;
		// Create the users backups dir is it does not exist.
		if(!fs.existsSync(backups_dir)){
			fs.mkdir(backups_dir, (err) => {
				if(err) throw err;
			});
		}

		res.render('backups/list', {
			title: "Backups",
			backups: fs.readdirSync(backups_dir),
			deleted: (req.query.backup_deleted == 'true'),
			restored: (req.query.backup_restored == 'true')
		});
	}
	else{
		res.redirect('/');
	}
});

module.exports = router;
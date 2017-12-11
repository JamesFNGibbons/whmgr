const router = require('express').Router();

/**
  * Take the user back to the home
  * screen if there is no application
  * to login to.
*/
router.get('/', (req, res) => {
	res.redirect('/'); 
});

/**
  * Used to take the user to the phpmyadmin
  * login screen.
*/
router.get('/phpmyadmin', (req, res) => {
	// Get the url of the whmgr
	req.db.collection('settings').find({name: 'url'}).toArray((err, docs) => {
		if(err) throw err;
		else{
			res.redirect('http://' + docs[0].value + '/phpmyadmin');
		}
	});
});

module.exports = router;
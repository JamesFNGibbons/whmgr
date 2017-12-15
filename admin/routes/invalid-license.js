const router = require('express').Router();

router.get('/*', (req, res) => {
	res.render('whmgr/invalid-license', {
		title: "Invalid License",
		pre_login: true
	});
});

module.exports = router;
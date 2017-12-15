const router = require('express').Router();
const ObjectId = require('mongodb').ObjectId;

/**
  * Route used to delete a bill.
*/
router.post('/delete', (req, res) => {
	if(req.session.loggedin){
		if(req.body.bill_id){
			req.db.collection('bills').remove({
				_id: ObjectId(req.body.bill_id)
			}, (err) => {
				if(err) throw err;
				else{
					res.redirect('/billing?bill_deleted=true');
				}
			});
		}
	}
	else{
		res.redirect('');
	}
});

/**
  * Route used to display the create 
  * bill form.
*/
router.get('/create', (req, res) => {
	if(req.session.loggedin){
		req.db.collection('accounts').find().toArray((err, accounts) => {
			if(err) throw err;
			else{
				res.render('billing/create', {
					title: "Create Bill",
					clients: accounts
				});
			}
		});
	}
	else{
		res.redirect('/');
	}
});

/**
  * Route used to add the new bill.
*/
router.post('/create', (req, res) => {
	if(req.session.loggedin){
		req.db.collection('bills').insert({
			product: req.body.product,
			ammount: req.body.ammount,
			account: req.body.client_account,
			sender: req.session.username,
			sent: new Date()
		}, (err) => {
			if(err) throw err;
			else{
				res.redirect('/billing?bill_sent=true');
			}
		});
	}
	else{
		res.redirect('/');
	}
});

/**
  * Route used to display an overview
  * of the billings.
*/
router.get('/', (req, res) => {
	if(req.session.loggedin){
		req.db.collection('bills').find().toArray((err, bills) => {
			if(err) throw err;
			else{
				res.render('billing/overview', {
					title: "Billing Overview",
					bills: bills,
					bill_sent: (req.query.bill_sent == 'true'),
					bill_deleted: (req.query.bill_deleted == 'true')
				});
			}
		});
	}
	else{
		res.redirect('/');
	}
});

/**
  * Route used to update the billing
  * options.
*/
router.post('/options', (req, res) => {
	if(req.session.loggedin){
		let option_exists = new Promise((resolve, reject) => {
			req.db.collection('settings').find({
				name: 'paypal'
			}).toArray((err, setting) => {
				if(err) throw err;
				else{
					resolve((setting.length > 0));
				}
			});
		});

		option_exists.then((exists) => {
			if(exists){
				req.db.collection('settings').update({
					name: 'paypal'
				}, {
					$set: {
						value: {
							'client_id': req.body.client_id,
							'secret': req.body.secret
						}
					}
				}, (err) => {
					if(err) throw err;
					else{
						res.redirect('/billing');
					}
				});
			}
			else{
				req.db.collection('settings').insert({
					name: 'paypal',
					value: {
						'client_id': req.body.client_id,
						'secret': req.body.secret
					}
				}, (err) => {
					if(err) throw err;
					else{
						res.redirect('/billing');
					}
				});
			}
		})
	}
	else{
		res.redirect('/');
	}
});

/**
  * The billing options screen.
*/
router.get('/options', (req, res) => {
	if(req.session.loggedin){
		req.db.collection('settings').find({
			name: 'paypal'
		}).toArray((err, setting) => {
			if(err) throw err;
			else{
				res.render('billing/settings', {
					title: "Billing Options",
					options_set: (setting.length > 0)
				});
			}
		});
	}
	else{
		res.redirect('/');
	}
});

module.exports = router;
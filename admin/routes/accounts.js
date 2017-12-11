const router = require('express').Router();
const exec = require('child_process').exec;
const linuxUser = require('linux-user');
const passwd = require('passwd-linux');
const mongoose = require('mongoose');

router.post('/add', (req, res) => {
  if(req.session.loggedin){
    let username = req.body.username;
    let password = req.body.password;
    let domain = req.body.domain;

    exec("sudo php /usr/local/whmgr/scripts/add-domain.php " + domain + " " + username + " " + password, (err, out) => {
      if(err) throw err;
      else{
        // Add the account details to the database.
        req.db.collection('accounts').insert({
          username: username,
          password: password,
          domain: domain
        });

        res.render('accounts/added', {
          title: "Added new account",
          output: out
        });
      }
    });
  }
});

router.get('/', (req, res) => {
  if(req.session.loggedin){
    linuxUser.getUsers((err, users) => {
      if(err) throw err;
      else {
        req.db.collection('accounts').find().toArray((err, accounts) => {
          res.render('accounts/list', {
              title: "View Users",
              users: accounts
            });
        });
      }
    })
  }
  else{
    res.redirect('/');
  }
});

router.get('/add', (req, res) => {
  if(req.session.loggedin){
    res.render('accounts/add', {
      title: "Add Account"
    });
  }
  else{
    res.redirect('/');
  }
});

module.exports = router;

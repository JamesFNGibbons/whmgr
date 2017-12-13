const router = require('express').Router();
const passwd = require('passwd-linux');
const os = require('os');

router.post('/', (req, res)  => {
  if(req.body.action && req.body.action == 'login'){
    passwd.checkPass(req.body.username, req.body.password, (err, response) => {
      if(err) throw err;

      // Check if the given password was corrct
      if(response == 'passwordCorrect'){
        // Set the default root user if not already set
        req.db.collection('root_users').find({
          username: req.body.username
        }).toArray((err, docs) => {
          if(err) throw err;
          else{
            if(docs.length == 0){
              req.db.collection('root_users').insert({
                username: req.body.username
              });
            }
          }
        });

        req.session.loggedin = true;
        req.session.username = req.body.username;
        res.redirect('/');
      }
      else{
        res.redirect('/?login_error=true');
      }
    })
  }

  if(req.body.action && req.body.action == 'set-domain'){
    /**
      * Check if we need to update or insert the
      * url into the database.
    */
    req.db.collection('settings').find({
      name: 'url'
    }).toArray((err, insert) => {
      insert = !(insert.length > 0);
      if(insert){
        req.db.collection('settings').insert({
          name: 'url',
          value: req.body.url
        }, (err) => {
          if(err) throw err;
          else{
            res.redirect('/');
          }
        });
      }
      else{
        req.db.collection('settings').update({
          name: 'url',
          $set : {
            value: req.body.url
          }
        }, (err) => {
          if(err) throw err;
          else{
            res.redirect('/');
          }
        });
      }
    });
  }
});

router.get('/', (req, res) => {
  // Render the login screen if the user is not loggedin
  if(req.session.loggedin){
    // Check if we need to get whmgr's url from the user
    req.db.collection('settings').find({
      name: "url"
    }).toArray((err, setting) => {

      let display_domain_selector = !(setting.length > 0);
      res.render('dash/home', {
        title: "Dashboard",
        display_domain_selector: display_domain_selector,
        the_ip: os.hostname(),
        client_loggedin: req.session.client_loggedin
      });
    });
  }
  else{
    if(req.session.client_loggedin){
      res.redirect('/clientarea');
    }
    else{
      res.render('auth/login', {
        title: "Login",
        login_error: req.query.login_error,
        pre_login: true
      });
    }
  }
});

module.exports = router;

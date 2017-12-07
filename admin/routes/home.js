const router = require('express').Router();
const passwd = require('passwd-linux');

router.post('/', (req, res)  => {
  if(req.body.action && req.body.action == 'login'){
    passwd.checkPass(req.body.username, req.body.password, (err, response) => {
      if(err) throw err;

      // Check if the given password was corrct
      if(response == 'passwordCorrect'){
        req.session.loggedin = true;
        req.session.username = req.body.username;
        res.redirect('/');
      }
      else{
        res.redirect('/?login_error=true');
      }
    })
  }
});

router.get('/', (req, res) => {
  // Render the login screen if the user is not loggedin
  if(req.session.loggedin){
    res.render('dash/home', {
      title: "Dashboard"
    });
  }
  else{
    res.render('auth/login', {
      title: "Login",
      login_error: req.query.login_error,
      pre_login: true
    });
  }
});

module.exports = router;

const router = require('express').Router();
const exec = require('child_process').exec;

router.get('/', (req, res) => {
  // Check that the user is loggedin
  if(!req.session.loggedin){
    res.redirect('/');
  }

  if(req.query.action == 'do-restart'){
    exec("sudo sh /usr/local/whmgr/scripts/restart-services.sh", (err, output) => {
        if(err) throw err;
        res.render('dash/services', {
          title: "Services",
          output: output,
          restarted: true
        });
    });
  }
  else{
    res.render('dash/services', {
      title: "Services",
    });
  }
});

module.exports = router;

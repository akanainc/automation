var express 	= require('express');
var router 		= express.Router();
var java 		= require('java');

java.classpath.push("routes/com.akana.ps.automation.security.jar");
var PasswordUtil = java.import('com.akana.ps.automation.security.PropertyEncryption');

/* GET home page. */
router.get('/', function(req, res, next) {
  	res.render('index', {
  		siteTitle: 'Encrypt Password',
  		encryptedPassword: ''
  	});
});

router.post('/encrypt', function ( req, res, next ) {
	var encryptedPassword = java.callStaticMethodSync('com.akana.ps.automation.security.PropertyEncryption', 'encryptString', req.body.password);

	res.render( 'index', {
		siteTitle: 'Encrypt Password',
		encryptedPassword: encryptedPassword
	});
});

module.exports = router;

var java = require( 'java' );

java.classpath.push("lib/com.akana.ps.automation.security.jar");
var PasswordUtil = java.import('com.akana.ps.automation.security.PropertyEncryption');

if (process.argv.length == 3) {

	var args = process.argv.slice(2);

	var encryptedPassword = java.callStaticMethodSync('com.akana.ps.automation.security.PropertyEncryption', 'encryptString', args[0]);

	console.log('Encrypted Password: ' + encryptedPassword);
} else {

	console.log('Need text to be encrypted (node index.js encryptMe)');
}


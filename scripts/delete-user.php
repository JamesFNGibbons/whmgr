#! /usr/local/whmgr/bin/php
<?php
	
	$domain = $argv[1];
	$username = $argv[2];

	// Remove the domain name
	print "Disabling the DNS records for domain." . PHP_EOL;
	system("a2dissite $domain");

	print "Removing DNS zone files for domain" . PHP_EOL;
	unlink("/etc/apache2/sites-available/$domain.conf");

	print "Deactivating the user account." . PHP_EOL;
	system("userdel $username --remove-home --remove-all-files");

	print "Reloading apache2 web server" . PHP_EOL;
	system("service apache2 reload");

	print "Done.". PHP_EOL;
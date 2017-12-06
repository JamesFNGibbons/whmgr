#! /usr/local/whmgr/bin/php
<?php
	
	$domain = $argv[1];
	$username = $argv[2];

	// Remove the domain name
	print "Disabling the DNS records for domain.";
	system("a2dissite $domain");

	print "Removing DNS zone files for domain";
	unlink("/etc/apache2/sites-available/$domain.conf");

	print "Deactivating the user account.";
	system("userdel $username");

	print "Done.";
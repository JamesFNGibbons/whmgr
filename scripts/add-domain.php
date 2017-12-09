#! /usr/local/whmgr/bin/php

<?php

	/**
	  * This is used to create a new domain.
	  * @param 1 = The new domain name
	  * @param 2 = The new user account.
	*/
	if(!count($argv) > 0) die('Failed! Invalid params');

	$domain = $argv[1];
	$username = $argv[2];
	$password = $argv[3];

	// Add the new user account
	print "Setting up the account" . PHP_EOL;
	shell_exec("adduser --quiet --disabled-password --shell /bin/bash --gecos '$domain' $username");
	shell_exec('echo "'.$username.':'.$password.'" | chpasswd');
	shell_exec("echo '$username' >> /etc/vsftpd.allowed_users");

	/**
	  * Take the default virtualhost zone file,
	  * and add it to the apache webserver.
	*/
	$vhost = file_get_contents('../defaults/apache/vhost.conf');
	$document_root = "/home/$username/public_html";
	$server_name = $domain;
	$vhost = str_replace('%doc_root%', $document_root, $vhost);
	$vhost = str_replace('%server_name%', $server_name, $vhost);

	file_put_contents("/etc/apache2/sites-available/$domain.conf", $vhost);
	print "Created the file \n";

	/**
	  * Create the www directory in the
	  * users home directory.
	*/
	if(!file_exists($document_root)){
		mkdir($document_root);
	}

	// Fix the permissions for the www data file within the directory.
	print "Setting permissions for the www directory" . PHP_EOL;
	system("chmod 755 $document_root", $out);

	/**
	  * Enable the new site that we have just created.
	*/
	print "Enabling the new site" . PHP_EOL;
	system("a2ensite $domain", $output);

	// Fix the users home dir permissions.
	print "Setting home directory permissions" . PHP_EOL;
	system("chmod +rx /home/$username/public_html/*");

	/**
	  * Reload apache
	*/
	print "Reloading apache web server ... \n";
	system("service apache2 reload", $output);
	print $output . PHP_EOL;

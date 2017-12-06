print "Welcome to whmgr installer";
print "Attempting to install apache2 web server";
apt-get install apache2
print "Done installing apache2 web server";
print "Attempting to install mysql server";
sudo debconf-set-selections <<< 'mysql-server mysql-server/root_password password my_password'
sudo debconf-set-selections <<< 'mysql-server mysql-server/root_password_again password my_password'
sudo apt-get -y install mysql-server

print "Installing php";
sudo apt-get install php
print "Restarting apache2 web server";
sudo service apache2 restart

print "Installing php5 mysql"
sudo apt-get install php5-mysql
print "Reloading apache2 web server"
sudo service apache2 restart

print "Moving the apache2 virtualhost config files";
mv /usr/local/whmgr/defaults/apache/whmgr-admin.conf /etc/apache2/sites-available
print "Enabling the new zone files";
a2ensite whmgr-admin
print "Reloading apache2"
service apache2 restart

print "Done!";
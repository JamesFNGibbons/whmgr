echo "           _
          | |
__      __| |__   _ __ ___    __ _  _ __
\ \ /\ / /| '_ \ | '_ ` _ \  / _` || '__|
 \ V  V / | | | || | | | | || (_| || |
  \_/\_/  |_| |_||_| |_| |_| \__, ||_|
                              __/ |
                             |___/       ";
echo "Install / Updated - This script will install / update whmgr";
sleep 3;

echo "Fetching your os software version";
gcc --version
echo "======================================";

if [ -f /etc/redhat-release ]; then
  echo "Sorry, but whmgr is only supported on Ubuntu";
  exit
fi

echo "Attempting to install apache2 web server";
apt-get install apache2
echo "Done installing apache2 web server";
echo "Attempting to install mysql server";
sudo debconf-set-selections <<< 'mysql-server mysql-server/root_password password my_password'
sudo debconf-set-selections <<< 'mysql-server mysql-server/root_password_again password my_password'
sudo apt-get -y install mysql-server

echo "Installing php";
sudo apt-get install php
echo "Restarting apache2 web server";
sudo service apache2 restart

echo "Installing php5 mysql"
sudo apt-get install php5-mysql
echo "Reloading apache2 web server"
sudo service apache2 restart

echo "Moving the apache2 virtualhost config files";
mv /usr/local/whmgr/defaults/apache/whmgr-admin.conf /etc/apache2/sites-available
echo "Enabling the new zone files";
a2ensite whmgr-admin
echo "Reloading apache2"
service apache2 restart

echo "Installing php5-cli module";
apt-get install php5-cli

echo "Installing NodeJS / NPM";
apt-get install nodejs;
apt-get install npm;
echo "Fixing nodejs alias to node";
cp /usr/bin/nodejs /usr/bin/node
echo "Installing PM2 via NPM";
npm install -g pm2

echo "Installing git";
apt-get install git

echo "Creating directories";
mkdir /usr/local/whmgr
echo "Downloading whmgr through git";
cd /uar/local/whmgr
git init
git pull https://github.com/JamesFNGibbons/whmgr.git master

echo "Updating npm modules";
cd /usr/local/whmgr/admin
npm install

echo "Installing mongodb";
sudo apt-get install mongodb
echo "Starting mongodb";
sudo /etc/init.d/mongodb start

echo "Attempting to launch whmgr";
chmod +x /usr/local/whmgr/service-run.sh
sh /usr/local/whmgr/service-run.sh

echo "Done!";

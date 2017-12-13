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

echo "Updating your system"
sudo apt-get update;

echo "Attempting to install apache2 web server";
apt-get install apache2
echo "Done installing apache2 web server";
echo "Attempting to install mysql server";
sudo debconf-set-selections <<< 'mysql-server mysql-server/root_password password my_password'
sudo debconf-set-selections <<< 'mysql-server mysql-server/root_password_again password my_password'
sudo apt-get -y install mysql-server

echo "Setting up mod_rewrite";
sudo a2enmod rewrite
sudo service apache2 restart

echo "Installing apache2 usedir mods";
sudo a2enmod usrdir
sudo service apache2 restart

echo "Installing php";
sudo apt-get install php5
echo "Restarting apache2 web server";
sudo service apache2 restart

echo "Installing curl";
sudo apt-get install php5-curl

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
cd /usr/local/whmgr
git init
git pull https://github.com/JamesFNGibbons/whmgr.git master

echo "Updating npm modules";
cd /usr/local/whmgr/admin
npm install

echo "Installing mongodb";
sudo apt-get install mongodb
echo "Starting mongodb";
sudo /etc/init.d/mongodb start

echo "Updating NodeJS Version to latest";
sudo npm cache clean -f
sudo npm install -g n
sudo n version latest
sudo n latest

echo "Installing vsfpt FTP Server";
sudo apt-get install vsftpd
sudo cp /etc/vsftpd.conf /etc/vsftpd.conf.orig

echo "Setting up FTP Firewall";
sudo ufw status
sudo ufw allow 20/tcp
sudo ufw allow 21/tcp
sudo ufw allow 990/tcp
sudo ufw allow 40000:50000/tcp
sudo ufw status

echo "Setting up webmail with apache";
sudo cp /usr/local/whmgr/defaults/apache/webmail.conf /etc/apache2/sites-available/webmail.conf;
sudo a2ensite webmail
sudo service apache2 restart

echo "Setting permissions for the whmgr root directory";
sudo chmod -R /usr/local/whmgr/root 400
echo "Allowing file uploads to whmgr root dir";
sudo chmod -R /usr/local/whmgr/root u+w

echo "Installing postfix email server";
echo -n "Please enter the root domain name of this server and press [ENTER]: ";
read root_domain;
debconf-set-selections <<< "postfix postfix/mailname string $domain"
debconf-set-selections <<< "postfix postfix/main_mailer_type string 'Internet Site'"
sudo apt-get install -y postfix

echo "Configuring user dir mailboxes";
sudo postconf -e "home_mailbox = mail/"
sudo  /etc/init.d/postfix restart

echo "Refining the postfix config settings";
sudo postconf -e "inet_interfaces = all"
sudo postconf -e "inet_protocols = all"
sudo service courier-authdaemon start
sudo systemctl enable courier-authdaemon
sudo  /etc/init.d/postfix restart

echo "Installing webmail to /var/www/html";
cd /var/www/html
wget https://www.rainloop.net/repository/webmail/rainloop-community-latest.zip
unzip rainloop-community-latest.zip
rm rainloop-community-latest.zip

echo "Installing unzip"
sudo apt-get install unzip

echo "Installing phpmyadmin";
cd /var/www/html
wget https://files.phpmyadmin.net/phpMyAdmin/4.7.6/phpMyAdmin-4.7.6-all-languages.zip
sudo unzip phpMyAdmin-4.7.6-all-languages.zip
mkdir phpmyadmin
mv unzip phpMyAdmin-4.7.6-all-languages/* ./phpmyadmin
rm phpMyAdmin-4.7.6-all-languages.zip
rm -rf phpMyAdmin-4.7.6-all-languages

echo "Installing web filemanager";
cd /var/www/html
mkdir filemanager
wget https://downloads.sourceforge.net/project/quixplorer/unstable/2.4.1%20beta/quixplorer-2.4.1beta.zipx
sudo unzip net2ftp_v1.1.zip
rm net2ftp_v1.1.zip
mv net2ftp_v1.1/files_to_upload/* ./filemanager
rm -rf ./net2ftp_v1.1

echo "Removing the apache ubunbu default splash page";
rm index.html

echo "Attempting to launch whmgr";
chmod +x /usr/local/whmgr/service-run.sh
sh /usr/local/whmgr/service-run.sh

echo "Done!";

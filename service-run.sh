echo "           _
          | |
__      __| |__   _ __ ___    __ _  _ __
\ \ /\ / /| '_ \ | '_ ` _ \  / _` || '__|
 \ V  V / | | | || | | | | || (_| || |
  \_/\_/  |_| |_||_| |_| |_| \__, ||_|
                              __/ |
                             |___/       ";
sleep 2;

echo "Launching web based admin console";
cd /usr/local/whmgr/admin
pm2 start index.js

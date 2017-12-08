echo "Attempting to restart services \n";
echo "Restarting apache2 \n";
service apache2 restart

echo "Restarting mysql \n";
service mysql restart

echo "Done.";

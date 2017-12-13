cd /home/$1/
d=$(date +'%Y-%m-%d');
zip --quiet -r ./exports/$d.zip ./
echo "/home/$1/exports/$d.zip";
echo "Rolling out"

cd /home/niven/website
git pull
sudo rsync -sav --progress --exclude=".git" /home/niven/website/* /var/www/html/
sudo service httpd restart
# oppdatere apt
apt update -y
wait
apt upgrade -y
wait 

#install node
apt-get install npm -y
wait 
npm i -g n
wait 
n install lts
wait 
n use lts
wait
exit

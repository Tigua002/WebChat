cd ../
rm -r WebChat
wait
git clone https://github.com/Tigua002/WebChat
wait
cd WebChat
nano .env
npm i express body-parser path mysql2 md5 fs multer nodemailer dotenv
wait
pm2 restart api
wait 
cd ../WebChat

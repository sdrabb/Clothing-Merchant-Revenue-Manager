install: install_nodejs install_npm install_mongodb install_bootstrap_ui install_packages

run:
	mongod --dbpath "./mydb" &
	npm start &

install_mongodb:
	sudo apt-key adv --keyserver hkp://keyserver.ubuntu.com:80 --recv 9DA31620334BD75D9DCB49F368818C72E52529D4
	echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu xenial/mongodb-org/4.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-4.0.list
	sudo apt-get update
	sudo apt-get install -y mongodb-org

install_nodejs:
	sudo apt-get update
	sudo apt-get install nodejs
	
install_npm:
	sudo apt-get install npm

install_packages:
	npm install

install_bootstrap_ui:
	wget https://angular-ui.github.io/bootstrap/ui-bootstrap-tpls-2.5.0.min.js
	mv ui-bootstrap-tpls-2.5.0.min.js public/javascripts/




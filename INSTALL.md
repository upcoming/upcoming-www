# Getting started

Install [Virtualbox](https://www.virtualbox.org/wiki/Downloads)

Download [Ubuntu Server](http://www.ubuntu.com/download/server) image. I used 14.04.2 LTS.

Create a new VM from the image. I set it to 4 GB RAM and 32 GB hard drive (dynamic).

Specify your hostname. I chose `upcoming`.

Specify your username and password.

The only package I selected was OpenSSH server.

Modify the Network adapter to use Bridged Adapter and select the network that provides your Internet connection. 

Start the VM.

Login.

Create a directory called `.ssh`:

```
mkdir .ssh
```

Copy your public key into `.ssh/authorized_keys`.

```
chmod 0600 .ssh/authorized_keys
```

Determine your IP address:

```
/sbin/ifconfig eth0| grep 'inet addr:'
```

Logout.

Trying logging in from your terminal:

```
ssh username@IP_ADDRESS
```

Congrats, you'll never have to use the Virtualbox console again!

## web user

I like to create a web user:

```
sudo adduser web
```

I usually just hit enter for the password prompts so that it doesn't associate a password with it. You'll have to do this three times.

```
sudo mkdir /var/www/
sudo chmod web:web /var/www
```

Add yourself to the `web` group:

```
useradd -G web username
```

## checkout the repo

```
sudo apt-get install git
sudo su web
cd /var/www/
git clone https://github.com/upcoming/upcoming-www.git
```

## install pip and python packages

```
sudo apt-get install python-pip
cd /var/www/upcoming-www
sudo pip install -r requirements.txt
```

## install rethinkdb

From the [RethinkDB website](http://www.rethinkdb.com/docs/install/ubuntu/):

```
source /etc/lsb-release && echo "deb http://download.rethinkdb.com/apt $DISTRIB_CODENAME main" | sudo tee /etc/apt/sources.list.d/rethinkdb.list
wget -qO- http://download.rethinkdb.com/apt/pubkey.gpg | sudo apt-key add -
sudo apt-get update
sudo apt-get install rethinkdb
```

## configure rethinkdb

```
sudo cp /etc/rethinkdb/default.conf.sample /etc/rethinkdb/instances.d/instance1.conf
sudo nano /etc/rethinkdb/instances.d/instance1.conf
```

Uncomment the bind command and make it (this is insecure, but it's a VM that isn't port forwarded to from your outside network, right?):

```
bind=all
```

Start the server:

```
sudo /etc/init.d/rethinkdb restart
```

## import test database

```
cd /var/www/upcoming-www/db
rethinkdb restore test-data.tar.gz --connect 127.0.0.1:28015
```

## configure site

```
cd /var/www/upcoming-www/conf
rm -f upcoming-www.json
cp default.json upcoming-www.json
```

Edit `upcoming-www.json`:

```
nano upcoming-www.json
```

Generate a random hash:

```
tr -cd '[:alnum:]' < /dev/urandom | fold -w64 | head -n1
```

and put it in `cookie_secret`.

Set your DB config:

```
  "db_host": "127.0.0.1",
  "db_port": 28015,
  "db_database": "upcoming",
```

Create a [new Twitter app](https://apps.twitter.com/app/new).

Set your callback URL to `http://IP_ADDRESS:8000`.

Edit your Twitter app, go to the Settings tab.

Check the box that says `Allow this application to be used to Sign in with Twitter` and click `Update Settings`.

Go to the `Keys and Access Tokens` tab and copy your Consumer Key and Secret to your config file.

Create a [new Foursquare app](https://foursquare.com/developers/register).

Copy the Client ID and Client Secret to your config file.

## install typeahead dist

(There's probably a better/correct way to do this?)

```
sudo apt-get install unzip
cd /var/www/upcoming-www/static/js/bower_components/typeahead.js
curl -O http://twitter.github.io/typeahead.js/releases/latest/typeahead.js.zip
unzip typeahead.js.zip
mv typeahead.js dist
```

## start the server

```
cd /var/www/upcoming-www
sudo python -m tornado.autoreload www.py
```

## set up edit/upload flow

I check out a copy of the codebase locally and configure my text editor to scp the current file to the server. You should see the server automatically restart, e.g.:

```
2015-03-24 01:05:56,357 : INFO : Starting on http://localhost:8000
2015-03-24 01:06:01,357 : INFO : handlers/auth.py modified; restarting server
2015-03-24 01:06:01,583 : INFO : Starting on http://localhost:8000
```

## test the site functionality

Go to `http://IP_ADDRESS:8000`

Click `LOGIN/SIGN UP` and then `Login with Twitter`. It should prompt you to enter your Twitter username/password and then redirect you back to the site, signed-in.

Click `ADD EVENT`. The Venue should autocomplete from Foursquare venues in Portland, OR.

Click on the event you just created. It should display.
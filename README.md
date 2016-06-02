# upcoming-www

Upcoming.org Rebuild

## Build Notes

This is little more than a roughly edited and unchecked extract from my bash history, but hopefully it'll help others. This was carried out on a fresh Ubuntu 16.04 machine.

* curl -sL https://deb.nodesource.com/setup | sudo bash -
* apt-get install nodejs npm git mysql-server redis-server unicode
* [give mysql a root password and remember it]
* git clone git@github.com:upcoming/upcoming-www.git
* cd upcoming-www
* npm install
* ln -s /usr/bin/nodejs /usr/bin/node
* node node_modules/unicode/install.js
* mysqladmin create upcoming -p
* [use mysql root password]
* mysql -p upcoming < db/schema.sql
* [use mysql root password]
* mysql -p
* [use mysql root password]
* `use upcoming`
* `set global sql_mode='STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_AUTO_CREATE_USER,NO_ENGINE_SUBSTITUTION';`
* Quit the mysql shell
* Go and create Twitter, Facebook, Foursquare, and Google Maps Javascript API tokens
* Edit `config/default.json` similar to the following:

````
{
  "session_secret": "123",
  "redis_password": "",

  "database": {
    "host": "localhost",
    "database": "upcoming",
    "user": "root",
    "pass": "[mysql root password from before]"
  },

  "twitter": {
    "consumer_key": "[REQUIRED]",
    "consumer_secret": "[REQUIRED]",
    "callback_url": ""
  },

  "facebook": {
    "app_id": "[REQUIRED]",
    "app_secret": "[REQUIRED]"
  },

  "foursquare": {
    "client_id": "[REQUIRED]",
    "client_secret": "[REQUIRED]"
  },

  "google": {
    "oauth_key": "",
    "oauth_secret": ""
  }
}
```

Note: The twitter `callback_url` can either be specified in this file, or in the twitter API token setup page. It should be `http://YOUR_HOSTNAME_OR_IP:3000/auth/twitter/callback`

Note2: I don't think the "google" oauth tokens are needed. I'm not sure the FB ones are either.

* Edit `views/add.jade` and change the 6th line, removing the `&key=AIzaSyB6e6ARbWZOETgBrJ54j3R0z7p93UzhYMQ` param and replacing it with `&key=YOUR_GOOGLE_MAPS_API_KEY`
* Run `./bin/www`
* Open a browser and point it at `http://YOUR_HOSTNAME_OR_IP:3000` and rejoice!

## Contributor Guidelines

TBD

## License
This project is released under the Apache 2.0 license. See the LICENSE file for the legal boiler-plate.

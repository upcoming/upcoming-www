#!/usr/bin/env python


### Libraries
import json
import logging
import os
from   pprint import pprint
import sys
import tornado.httpserver
import tornado.ioloop
from   tornado.options import define, options
import tornado.web


### Handlers
import handlers
from   handlers.auth import *
from   handlers.event import *
from   handlers.main import *
from   handlers.search import *
from   handlers.trip import *
from   handlers.user import *
from   handlers.venue import *


### PATHS
HOME_DIR = os.path.dirname(os.path.realpath(__file__))
LOG_DIR = '%s/logs' % HOME_DIR


### Logging
FORMAT = '%(asctime)-15s : %(levelname)s : %(message)s'
if sys.stdout.isatty():
  logging.basicConfig(filename='%s/www.log' % LOG_DIR,level=logging.DEBUG,format=FORMAT)

  console = logging.StreamHandler()
  console.setLevel(logging.DEBUG)
  formatter = logging.Formatter(FORMAT)
  console.setFormatter(formatter)
  logging.getLogger('').addHandler(console)
  debug = 1
else:
  logging.basicConfig(filename='%s/www.log' % LOG_DIR,level=logging.INFO,format=FORMAT)
  debug = 0


### Options
tornado.options.define('port', default=8000, help='run on the given port')
if os.path.exists('%s/conf/upcoming-www.json' % HOME_DIR):
  tornado.options.define('config_file', default='%s/conf/upcoming-www.json' % HOME_DIR, help='filename for additional configuration')
else:
  logging.error('Copy conf/default.json to conf/upcoming-www.json and populate to run')
  logging.error('Shutting Down')
  sys.exit()


### APP
class Application(tornado.web.Application):
  def __init__(self):      
    ### Handlers
    handlers = [
      (r'/', MainHandler),
      (r'/@(.*)', UserHandler),
      (r'/~(.*)', UserHandler),
      (r'/event/add', EventAddHandler),
      (r'/event/(?:.*-|)(.+)$', EventHandler),

      # Login
      (r'/login', LoginHandler),
      (r'/login/registration', LoginRegistrationHandler),
      (r'/login/facebook', FacebookLoginHandler),
      (r'/login/google', GoogleLoginHandler),
      (r'/login/twitter', TwitterLoginHandler),
      (r'/logout', LogoutHandler),

      (r'/search', SearchHandler),
      (r'/trip/add', TripAddHandler),
      (r'/trip/(?:.*-|)(.+)$', TripHandler),
      (r'/venue/search/(.*)', VenueSearchHandler),
      (r'/venue/(.*)', VenueHandler),
      (r'/assets/(.*)', tornado.web.StaticFileHandler, {'path': './static'}),   
    ]

    ### Settings
    settings = {
      'login_url': '/login',
      'static_path': os.path.join(os.path.dirname(__file__), 'static'),
      'template_path': os.path.join(os.path.dirname(__file__), 'templates'),
      'debug': debug,
      'autoescape': None,

      'pycket': {
        'engine': 'memcached',
        'storage': {
          'servers': ('localhost:11211',)
        },
      },
    
    }

    # Load JSON settings
    settings.update(json.loads(open(options.config_file).read()))

    # DB Init
    r.connect(settings['db_host'], settings['db_port'], settings['db_database']).repl()

    tornado.web.Application.__init__(self, handlers, **settings)


def main():
  tornado.options.parse_command_line()
  http_server = tornado.httpserver.HTTPServer(Application())
  http_server.listen(options.port)
  logging.info('Starting on http://localhost:%s' % options.port)
  tornado.ioloop.IOLoop.instance().start()


if __name__ == '__main__':
  main()

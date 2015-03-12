#!/usr/bin/env python


import json
import logging
import os
from   pprint import pprint
import sys
import tornado.httpserver
import tornado.ioloop
from   tornado.options import define, options
import tornado.web


import handlers
from   handlers.auth import *
from   handlers.event import *
from   handlers.main import *
from   handlers.user import *
from   handlers.venue import *
from   handlers.search import *


### PATHS
HOME_DIR = os.path.dirname(os.path.realpath(__file__))
LOG_DIR = '%s/logs' % HOME_DIR


### Logging
FORMAT = '%(asctime)-15s : %(levelname)s : %(message)s'
if sys.stdout.isatty():
  logging.basicConfig(filename='%s/upcoming.log' % LOG_DIR,level=logging.DEBUG,format=FORMAT)

  console = logging.StreamHandler()
  console.setLevel(logging.DEBUG)
  formatter = logging.Formatter(FORMAT)
  console.setFormatter(formatter)
  logging.getLogger('').addHandler(console)
  debug = 1
else:
  logging.basicConfig(filename='%s/upcoming.log' % LOG_DIR,level=logging.INFO,format=FORMAT)
  debug = 0


tornado.options.define('port', default=8000, help='run on the given port')
tornado.options.define('config_file', default='./conf/upcoming-www.json', help='filename for additional configuration')




class Application(tornado.web.Application):
  def __init__(self):      
    handlers = [
      (r'/', MainHandler),
      (r'/@(.*)', UserHandler),
      (r'/event/add', EventAddHandler),
      (r'/event/([^-]*)$', EventHandler),
      (r'/event/.*-(.*)$', EventHandler),

      # Login
      (r'/login', LoginHandler),
      (r'/login/facebook', FacebookLoginHandler),
      (r'/login/google', GoogleLoginHandler),
      (r'/login/twitter', TwitterLoginHandler),
      (r'/logout', LogoutHandler),

      (r'/search', SearchHandler),
      (r'/venue/search/(.*)', VenueSearchHandler),
      (r'/venue/(.*)', VenueHandler),
      (r'/assets/(.*)', tornado.web.StaticFileHandler, {'path': './static'}),   
    ]

    settings = {
      'login_url': '/login',
      'template_path': os.path.join(os.path.dirname(__file__), 'templates'),
      'debug': True,
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
  tornado.ioloop.IOLoop.instance().start()


if __name__ == '__main__':
  main()

import memcache
from   pycket.session import SessionMixin
from   tornado.escape import json_decode, json_encode
import tornado.web


class BaseHandler(tornado.web.RequestHandler, SessionMixin):
  COOKIE_NAME = 'upcoming'


  ### Session
  @property
  def mc(self):
    try:
      return self._mc
    except:
      self._mc = memcache.Client(['127.0.0.1:11211'])
      return self._mc


  ### User
  @property
  def user(self):
    return self.get_current_user()

  def get_current_user(self):
    user_json = self.get_secure_cookie(self.COOKIE_NAME)
    if not user_json:
      return None
    return json_decode(user_json)
  

  def render(self, template_name, **kwargs):
    if not kwargs.has_key('user'):
      kwargs['user'] = {
        'screen_name': 'nouser!',
        'name': 'noname',
        'description': '',
        'profile_image_url': 'https://pbs.twimg.com/profile_images/458794021528158209/9VM3pPXW_normal.jpeg',
      }

    super(BaseHandler, self).render(template_name, **kwargs)


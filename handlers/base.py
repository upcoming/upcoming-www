from   tornado.escape import json_decode, json_encode
import tornado.web


class BaseHandler(tornado.web.RequestHandler):
  COOKIE_NAME = 'upcoming'

  def get_current_user(self):
    user_json = self.get_secure_cookie(self.COOKIE_NAME)
    if not user_json:
      return None
    return json_decode(user_json)

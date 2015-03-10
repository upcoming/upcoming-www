from   base import *
import rethinkdb as r
import tornado.auth
from   tornado.escape import json_decode, json_encode
import tornado.gen
import tornado.web


class LoginHandler(BaseHandler, tornado.auth.TwitterMixin):
  @tornado.gen.coroutine
  def get(self):
    if self.get_argument('oauth_token', None):
      user = yield self.get_authenticated_user()            
      # user['created_at'] = r.now()
            
      # if new user
      r.table("users").insert(user).run()
            
      # else update info

      # delete user description to reduce cookie size
      del user["description"]
            
      self.set_secure_cookie(self.COOKIE_NAME, json_encode(user))
      self.redirect('/')
    else:
      yield self.authorize_redirect(callback_uri=self.request.full_url())


class LogoutHandler(BaseHandler, tornado.web.RequestHandler):
  def get(self):
    self.clear_cookie(self.COOKIE_NAME)
    self.redirect('/')

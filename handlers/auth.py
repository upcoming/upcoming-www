from   base import *
import rethinkdb as r
import json
import logging
import tornado.auth
from   tornado.escape import json_decode, json_encode
import tornado.gen
import tornado.web


'''
For documentation on login model, see:
https://github.com/upcoming/upcoming/wiki/Data-Model:-Users

* login   - authentication methods
* user    - person (internal use only to attach multiple logins and accounts)
* account - personas/profiles (external facing)
'''


### Decorator
def authorized(method):
  """Decorate methods with this to require that the user be logged in."""
  @functools.wraps(method)
  def wrapper(self, *args, **kwargs):
    if not self.current_user:
      if self.request.method in ("GET", "HEAD"):
        url = self.get_login_url()
        if "?" not in url:
          if urlparse.urlsplit(url).scheme:
            # if login url is absolute, make next absolute too
            next_url = self.request.full_url()
          else:
            next_url = self.request.uri
          url += "?" + urllib.urlencode(dict(next=next_url))
        self.redirect(url)
        return
      raise HTTPError(403)
    return method(self, *args, **kwargs)
  return wrapper


### Auth Helper Mixin
class AuthMixin():
  # This should look for an existing login/user
  def check_login(self, login):
    pass

  # What to do when we fail
  def fail_login(self, error, redirect='/login'):
    self.errors.append(error)
    self.redirect(redirect)

  # Get a user
  def get_user(self, user_id):
    pass

  # login
  def login(self, login):
    try:
      l = self.check_login(login)
      u = self.get_user(l['user_id'])
      permissions = json.loads(u['permissions'])
    except:
      self.errors.append('Failed login.')
      logging.info('FAILED LOGIN: %s' % login)
      self.logout()
      return

    self.session.set('login', login)
    self.session.set('user', u)
    self.session.set('permissions', permissions)

    redirect = self.session.get('redirect')
    self.session.delete('redirect')
    if not redirect or redirect.startswith('/login') or redirect.startswith('/logout'):
      redirect = '/'
    logging.info('LOGIN: %s , %s' % (login, l['user_id']))

    self.redirect(redirect)

  def logout(self):
    logging.info('LOGOUT: destroying session for %s' % self.get_current_user())

    # Clear Cookie
    self.clear_cookie(self.COOKIE_NAME)

    # Pycket really needs session destroy...
    self.session.delete('redirect')
    self.session.delete('login')
    self.session.delete('user')
    self.session.delete('permissions')

    self.redirect('/')


### Global Login / Logout
class LoginHandler(BaseHandler):
  def get(self):
    self.session.set('redirect', self.get_argument('next', None))
    print self.session.get('redirect')
    self.render('login.html')


class LoginRegistrationHandler(BaseHandler):
  def get(self):
    pass
    


class LogoutHandler(BaseHandler, AuthMixin):
  def get(self):
    self.logout()


### Twitter
class TwitterLoginHandler(BaseHandler, AuthMixin, tornado.auth.TwitterMixin):
  @tornado.gen.coroutine
  def get(self):
    if self.get_argument('oauth_token', None):
      user = yield self.get_authenticated_user()            

      '''
      TODO: 
      * check if user is in table or not
      * if not, create a new 

        * login
          * service (twitter, facebook)
          * user_id (twitter id, fbuid)
          * key
          * secret
          * screen_name
          * dump

        * user
          * user_id (basehashed snowflake)
          * email address
          logins {}
          preferences {}

        * account
          * name
          * twitter_screen_name
          * screen_name
          * attached
          * users {}
      '''

      # if new user
      r.table('user').insert(user).run()

      # else update info

      # delete user fields to reduce cookie size
      del user['description']
      del user['status']
      del user['entities']

      self.set_secure_cookie(self.COOKIE_NAME, json_encode(user))
      self.redirect('/')
    else:
      yield self.authenticate_redirect(callback_uri=self.request.full_url())


### Facebook
class FacebookLoginHandler(BaseHandler, AuthMixin, tornado.auth.FacebookGraphMixin):
  @tornado.web.asynchronous
  def get(self):
    if self.get_argument('code', None):
      self.get_authenticated_user(redirect_uri=self.request.full_url(),
                                  client_id=self.settings['facebook_app_id'],
                                  client_secret=self.settings['facebook_app_secret'],
                                  code=self.get_argument('code'),
                                  callback=self.async_callback(self._on_auth)
                                 )
    else:
      self.authorize_redirect(redirect_uri=self.request.full_url(),
                              client_id=self.settings['facebook_app_id'],
                              extra_params={'scope': 'email'}
                             )


  @tornado.web.asynchronous
  def _on_auth(self, oauth):
    if not oauth or not oauth['access_token']:
      self.fail_login('Sorry, the Facebook login failed')
    else:
      self.facebook_request("/me", access_token=oauth["access_token"], callback=self.async_callback(self._on_auth2))


  def _on_auth2(self, fb):
    if not fb or not fb.has_key('email'):
      self.fail_login('Sorry, the Facebook login failed')
    else:
      self.login(fb['email'])


### Google
class GoogleLoginHandler(BaseHandler, AuthMixin, tornado.auth.GoogleOAuth2Mixin):
  @tornado.gen.coroutine
  def get(self):
    # TODO: generate host (dev, etc)
    redirect_uri = '%s/login/google' % 'host'

    if self.get_argument('code', False):
      user = yield self.get_authenticated_user(
        redirect_uri=redirect_uri,
        code=self.get_argument('code'))
      # Save the user with e.g. set_secure_cookie
      yield self._on_auth(user)
    else:
      yield self.authorize_redirect(
        redirect_uri=redirect_uri,
        client_id=self.settings['google_oauth_key'],
        scope=['profile', 'email'],
        response_type='code',
        extra_params={'approval_prompt': 'auto'})

  @tornado.gen.coroutine
  def _on_auth(self, oauth):
    ## auth fail
    if not oauth:
      self.fail_login('Sorry, the Google login failed')
    else:
      access_token = str(oauth['access_token'])
      http_client = self.get_auth_http_client()
      response = yield http_client.fetch('https://www.googleapis.com/oauth2/v1/userinfo?access_token='+access_token)
      user = json.loads(response.body)
      self.login(user['email'])
      self.redirect('/')

from   base import *
import rethinkdb as r
import tornado.web


class UserHandler(BaseHandler, tornado.web.RequestHandler):
    def get(self, username=None):
        current_user = self.get_current_user()
        user = r.table("users").get_all(username, index="username").limit(1).run()
        
        self.render(
            "user.html",
            user = user.next(),
            current_user = current_user
        )

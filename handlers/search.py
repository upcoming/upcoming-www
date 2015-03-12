from   base import *
import rethinkdb as r
import tornado.web


class SearchHandler(BaseHandler, tornado.web.RequestHandler):
  def get(self, event_id=None):
    current_user = self.get_current_user()
    events = r.table("events").order_by(index='start_date').limit(100).run()

    self.render(
      "search.html",
      events = events,
      current_user = current_user
    )

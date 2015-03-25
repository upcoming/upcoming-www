from   base import *
import rethinkdb as r
import tornado.web


class MainHandler(BaseHandler, tornado.web.RequestHandler):
  def get(self):
    current_user = self.get_current_user()
    events = r.table('event').order_by(
        index='start_date'
      ).filter( 
        lambda event: (event['start_date'] >= r.now())
      ).eq_join(
        'creator_user_id', r.table("user")
      ).without({'right': {'description': True}}).zip().eq_join(
        'venue_id', r.table('venue'), index='venue_id'
      ).zip().limit(20).run()

    self.render(
      "list.html",
      events = events,
      current_user = current_user
    )

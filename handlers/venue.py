from   base import *
import rethinkdb as r
import tornado.web


class VenueHandler(BaseHandler, tornado.web.RequestHandler):
    def get(self, venue_id=None):
        current_user = self.get_current_user()
        events = r.table("events").get_all(venue_id, index="venue_id").run()
                    
        self.render(
            "venue.html",
            events = events,
            current_user = current_user
        )

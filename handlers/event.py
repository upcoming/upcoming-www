from   base import *
import foursquare
import rethinkdb as r
import tornado.web


class EventHandler(BaseHandler, tornado.web.RequestHandler):
  def get(self, event_id=None):
    current_user = self.get_current_user()
    event = r.table("events").get(event_id).run()
          
    self.render(
      "event.html",
      event = event,
      current_user = current_user
    )


class EventAddHandler(tornado.web.RequestHandler):
  def get(self):
    client = foursquare.Foursquare(client_id=self.settings['foursquare_client_id'], client_secret=self.settings['foursquare_client_secret'])
    venues = client.venues.search(params={'query': 'Rev Hall', 'near': 'Portland, OR', 'intent': 'browse'})

    self.render(
      "add.html",
      venues = venues['venues']
    )

  def post(self):
    event = dict()
    event_fields = [
      'title', 'start_date', 'end_date', 'start_time', 'end_time', 'description', 'website',
      'venue_id', 'venue_name', 'venue_address', 'venue_locality', 'venue_region', 'venue_postal_code',
      'venue_latitude', 'venue_longitude', 'creator_user_id', 'creator_username', 'creator_avatar'
      ]
    event['created_at'] = r.now()
    for key in event_fields:
      event[key] = self.get_argument(key, None)
    r.table("events").insert(event).run()
    self.redirect("/")

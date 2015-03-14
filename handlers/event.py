from   base import *
import rethinkdb as r
import tornado.web
from simpleflake import simpleflake
from basehash import base62


class EventHandler(BaseHandler, tornado.web.RequestHandler):
  def get(self, event_id=None):
    current_user = self.get_current_user()
    event = r.table("events").get_all(
      event_id, index='event_id'
    ).eq_join(
      "venue_id", r.table("venues"), index='venue_id'
    ).zip().run()
    
    self.render(
      "event.html",
      event = event.next(),
      current_user = current_user
    )


class EventAddHandler(tornado.web.RequestHandler):
  def get(self):
    self.render(
      "add.html"
    )

  def post(self):
    event = dict()
    event_fields = [
      'title', 'start_date', 'end_date', 'start_time', 'end_time', 'description', 
      'website','creator_user_id'
      ]

    venue = dict()
    venue_fields = [
      'foursquare_id', 'name', 'address', 'locality', 'region', 'postal_code',
      'longitude', 'latitude', 'creator_user_id'
      ]

    for key in event_fields:
      event[key] = self.get_argument(key, None)

    for key in venue_fields:
      venue[key] = self.get_argument(key, None)

    event_uuid = simpleflake()
    event['event_id'] = base62().hash(event_uuid, 12)

    venue_uuid = simpleflake()
    venue['venue_id'] = base62().hash(venue_uuid, 12)
    
    event['venue_id'] = venue['venue_id']

    event['created_at'] = r.now()
    event['updated_at'] = r.now()

    venue['geo'] = r.point(float(venue['longitude']), float(venue['latitude']))
    venue['created_at'] = r.now()
    venue['updated_at'] = r.now()

    r.table("events").insert(event).run()
    r.table("venues").insert(venue).run()
    self.redirect("/")
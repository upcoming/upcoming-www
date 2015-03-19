from   base import *
import rethinkdb as r
import tornado.web
from simpleflake import simpleflake
from basehash import base62


class TripHandler(BaseHandler, tornado.web.RequestHandler):
  def get(self, trip_id=None):
    current_user = self.get_current_user()
    trip = r.table("trip").get_all( trip_id, index='trip_id' ).run().next()
    creator = r.table("user").get( trip['creator_user_id'] ).run()

    self.render(
      "trip.html",
      trip = trip,
      creator = creator,
      current_user = current_user
    )


class TripAddHandler(BaseHandler, tornado.web.RequestHandler):
  def get(self):
    self.render(
      "trip.html"
    )

  def post(self):
    user = self.get_current_user()

    trip = dict()
    trip_fields = {
      'start_date': 'start_date', 
      'end_date': 'end_date', 
      'description': 'description', 
      'place_id': 'place_id',
      'address': 'formatted_address',
      'locality': 'locality',
      'region': 'administrative_area_level_1',
      'county': 'administrative_area_level_2',
      'longitude': 'lng',
      'latitude': 'lat'
      }

    for key in trip_fields:
      trip[key] = self.get_argument(trip_fields[key], None)

    trip_uuid = simpleflake()
    trip['trip_id'] = base62().hash(trip_uuid, 12)

    trip['created_at'] = r.now()
    trip['updated_at'] = r.now()
    trip['creator_user_id'] = user['id']

    trip['geo'] = r.point(float(trip['longitude']), float(trip['latitude']))

    r.table("trip").insert(trip).run()
    self.redirect("/")
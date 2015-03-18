from base import *
import foursquare
import rethinkdb as r
from tornado.escape import json_decode, json_encode
import tornado.web


class VenueHandler(BaseHandler, tornado.web.RequestHandler):

    def get(self, venue_id=None):
        current_user = self.get_current_user()
        events = r.table("event").get_all(venue_id, index="venue_id").run()

        self.render(
            "venue.html",
            events=events,
            current_user=current_user
        )


class VenueSearchHandler(BaseHandler, tornado.web.RequestHandler):

    def get(self, vars=None):
        city = self.get_argument('city', None)
        query = self.get_argument('query', None)

        client = foursquare.Foursquare(
            client_id=self.settings['foursquare_client_id'],
            client_secret=self.settings['foursquare_client_secret'])
        if city is None or city == '':
            intent = 'global'
        else:
            intent = 'browse'

        venues = client.venues.suggestcompletion(
            params={
                'query': query,
                'near': city,
                'intent': intent,
                'limit': 10})

        json = tornado.escape.json_encode(venues['minivenues'])
        self.write(json)

from base import *
import rethinkdb as r
import tornado.web
from simpleflake import simpleflake
from basehash import base62


class EventHandler(BaseHandler, tornado.web.RequestHandler):

    def get(self, event_id=None):
        current_user = self.get_current_user()
        event = r.table("event").get_all(
            event_id,
            index='event_id').run().next()
        venue = r.table("venue").get_all(
            event['venue_id'],
            index='venue_id').run().next()
        creator = r.table("user").get(event['creator_user_id']).run()

        self.render(
            "event.html",
            event=event,
            venue=venue,
            creator=creator,
            current_user=current_user
        )


class EventAddHandler(BaseHandler, tornado.web.RequestHandler):

    def get(self):
        self.render(
            "add.html"
        )

    def post(self):
        user = self.get_current_user()

        event = dict()
        event_fields = [
            'title', 'start_date', 'end_date', 'start_time', 'end_time',
            'description', 'website'
        ]

        venue = dict()
        venue_fields = [
            'foursquare_id', 'name', 'address', 'locality', 'region',
            'postal_code', 'longitude', 'latitude'
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
        event['creator_user_id'] = user['id']

        venue['geo'] = r.point(
            float(
                venue['longitude']), float(
                venue['latitude']))
        venue['created_at'] = r.now()
        venue['updated_at'] = r.now()
        venue['creator_user_id'] = user['id']

        r.table("event").insert(event).run()
        r.table("venue").insert(venue).run()
        self.redirect("/")

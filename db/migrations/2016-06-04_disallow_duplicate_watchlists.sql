ALTER IGNORE TABLE `watchlist` ADD UNIQUE KEY `watchlist_event_user` (`event_id`, `user_id`);

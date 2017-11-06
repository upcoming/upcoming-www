# As advised by https://medium.com/@niratattri/building-a-node-js-application-and-deploying-through-docker-meet-docker-aa8ae677ea12
# However, it might be better to just use the vanilla MySQL image and mount this folder into it, using either a bind or volume mount
FROM mysql

# Initial DB creation and settings
COPY init_db.sql /docker-entrypoint-initdb.d/

# DB schema
COPY schema_dropless.sql /docker-entrypoint-initdb.d/

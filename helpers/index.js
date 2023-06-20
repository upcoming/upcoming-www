const config = require('config');
const db = require('../db.js');
const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");
const axios = require('axios');
const path = require('path');

exports.saveAvatar = async function(user, profile) {
  const s3 = new S3Client({
    region: config.s3.region,
    credentials: {
      accessKeyId: config.s3.access_key_id,
      secretAccessKey: config.s3.secret_access_key,
    }
  });

  const extensionToMimeType = {
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png',
    '.gif': 'image/gif'
  };

  const imageUrl = profile._json.profile_image_url;
  const bucketName = config.s3.bucket;
  const extension = path.extname(imageUrl);
  const mimeType = extensionToMimeType[extension];

  if (!mimeType) {
    extension = '.jpg';
    mimeType = 'image/jpeg';
  }

  const key = 'avatars/' + user.id + extension;

  // Axios request to get image
  const response = await axios.get(imageUrl, { responseType: 'arraybuffer' });

  // Prepare and upload the file to S3
  const uploadParams = {
    Bucket: bucketName,
    Key: key,
    Body: response.data,
    ContentType: mimeType  // Set the MIME type based on the extension
  };

  try {
    const data = await s3.send(new PutObjectCommand(uploadParams));
    const s3ImageURL = `https://s3-${config.s3.region}.amazonaws.com/${bucketName}/${key}`;
    console.log(s3ImageURL);

    db.query('UPDATE user SET avatar_image_url = ? WHERE id = ?', [s3ImageURL, user.id], function (err, result) {
      if (err) {
        console.error(err);
        throw err;
      }
    });
    return data;

  } catch (err) {
    console.error(err);
    throw err;
  }

}


exports.reverse_geocode = function(venue_id, next) {
  db.query("SELECT * FROM venue WHERE venue_id = ?", venue_id, function(err, rows) {
    if (err) {
      return next(err);
    }

    if (rows.length > 0) {
      var venue = rows[0];
      var options = {
        uri: config.geocode_earth.endpoint + '/v1/reverse',
        qs: {
          api_key: config.geocode_earth.api_key,
          'point.lat': venue.latitude,
          'point.lon': venue.longitude,
          size: 1
        },
        json: true
      };

      request(options, function(error, response, body) {
        if (!error && response.statusCode === 200) {
          if (body.features[0]) {
            var properties = body.features[0].properties;
            var layers = ['neighbourhood', 'borough', 'localadmin', 'locality', 'county', 'macrocounty', 'region', 'macroregion', 'country'];

            for (var i=0; i < layers.length; i++) {
              var layer = layers[i];
              if (layer in properties) {
                var layer_gid = layer + '_gid';

                var sql = 'INSERT IGNORE INTO venue_gid (venue_id, name, gid, layer, created_at) '
                  + 'VALUES (?, ?, ?, ?, NOW())';

                db.query(sql, [venue_id, properties[layer], properties[layer_gid], layer], function (err, result) {
                  if (err) return next(err);
                });
              }
            }
          }
        }
      });
    } else {
      next(null, rows[0]);
    }
  });
};

$(document).ready(function(e) {
  $(".list-item #add-city").click(function(e){
  	e.preventDefault();
    $('#autocomplete').css('display','block');
    $('.tt-input').focus();
  });
  
  $("#filters").on('click', 'a.remove-city', function(e) {
  	e.preventDefault();
    var gid = $(this).closest('.list-item').find('a').data('filter');
    $.post('/user/location', { gid: gid, status: 'remove' }, function(data) {});
  	$(this).closest('.list-item').remove();
  });

  var cities = new Bloodhound({
    datumTokenizer: Bloodhound.tokenizers.obj.whitespace('label'),
    queryTokenizer: Bloodhound.tokenizers.whitespace,
    remote: {
      cache: true,      
      rateLimitBy: 'throttle',
      rateLimitWait: 1000,
      url: 'https://search.mapzen.com/v1/autocomplete?sources=wof&api_key=mapzen-MBvh2sM&layers=locality,borough,localadmin&text=%QUERY',
      replace: function(url, query) {
        return url.replace('%QUERY', query)
      },
      transform: function(response) {
        response.features.map(function(addr) {
            addr.label = addr.properties.label;
            return addr;
          });
        return response.features;
      }
    }
  });
  
  cities.initialize();
  
  $('#name').typeahead({
      hint: true,
      highlight: true,
      minLength: 1
    }, {
      name: 'Search',
      display: 'label',
      source: cities,
      templates: {
        empty: [
          '<div class="empty-message">',
            'No city found!',
          '</div>'
        ].join('\n'),
        suggestion: Handlebars.compile(
          '<div>{{label}}</div>'
        )
      }
    }
  ).on('typeahead:selected', onSelected);

  $('#autocomplete .twitter-typeahead').on('keyup', function(e) {
    if(e.which == 13) {
      $(".tt-suggestion:first-child", this).trigger('click');
    }
  });

  function onSelected($e, place) {
    if (place.properties.layer == 'borough') {
      place_name = place.properties.borough;
      place_gid = place.properties.borough_gid;      
    } else if (place.properties.layer == 'localadmin') {
      place_name = place.properties.localadmin;
      place_gid = place.properties.localadmin_gid;      
    } else {
      place_name = place.properties.locality;
      place_gid = place.properties.locality_gid;
    }
    
    var place_div = '<div class="list-item">'
          + '<a href="#" data-cat="gid" data-filter="' + place_gid + '"> ' 
          + place_name + '</a> '
          + '<a href="#" class="remove-city"><span class="glyphicon glyphicon-remove-circle" aria-hidden="true"></a>';

    // add the city to the nav and blank/hide the autocomplete form
    $('#city-list .list-item:last-child').before(place_div);
    $('#autocomplete').css('display','none');
    $('#name').typeahead('val', '');

    // save user location preference to db    
    var post = { gid: place_gid, status: 'add' };
    $.post('/user/location', post, function(data) {});  

    $.post('/place/add', { json: JSON.stringify(place) }, function(data) {}, 'json');  
  }
});
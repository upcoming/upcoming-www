$(document).ready(function(e) {
  $("#add-city").click(function(e){
  	e.preventDefault();
    $('#autocomplete').css('display','block');
    $('.tt-input').focus();
  });
  
  $(".remove-city").click(function(e){
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
      url: 'https://search.mapzen.com/v1/autocomplete?sources=wof&api_key=mapzen-MBvh2sM&layers=locality&text=%QUERY',
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
  
  function onSelected($e, city) {
    var city_div = '<div class="list-item">'
          + '<a href="#" data-cat="gid" data-filter="' + city.properties.locality_gid + '"> ' 
          + city.properties.locality + '</a> '
          + '<a href="#" class="remove-city"><span class="glyphicon glyphicon-remove-circle" aria-hidden="true"></a>';

    // add the city to the nav and blank/hide the autocomplete form
    $('#city-list .list-item:last-child').before(city_div);
    $('#autocomplete').css('display','none');
    $('#name').typeahead('val', '');

    // save user location preference to db    
    var post = { gid: city.properties.locality_gid, status: 'add' };
    $.post('/user/location', post, function(data) {});  

    $.post('/place/add', { json: JSON.stringify(city) }, function(data) {}, 'json');  
  }
});
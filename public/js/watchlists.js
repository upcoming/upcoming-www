$(document).ready(function() {
  // HACK: Setting Recommended Status via AJAX Call
  $.get('/watchlist/status/' +  $('#event_id').val(), function(data) {
    if(data) {
      $('#watchlist-btn').addClass('watchlist-active');
      $('#status').val('remove');
    }
  });

  // Add/Remove from Watchlist
  $('#watchlist-btn').click(function(e) {
    e.stopPropagation();

    var post = { 
      event_id: $('#event_id').val(), 
      status: $('#status').val()
    };

    $.post('/watchlist', post, function(data) {
      if($('#status').val() == 'watch') {
        $('#watchlist-btn').addClass('watchlist-active');
        $('#status').val('remove');
      } else {
        $('#watchlist-btn').removeClass('watchlist-active');
        $('#status').val('watch');
      }
    });

    return false;
  });
});


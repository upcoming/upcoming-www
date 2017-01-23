$(document).ready(function() {
  // HACK: Setting Recommended Status via AJAX Call
  // $.get('/watchlist/status/' +  $('#event_id').val(), function(data) {
  //   if(data) {
  //     $('#watchlist-btn').addClass('watchlist-active');
  //     $('#status').val('remove');
  //   }
  // });

  $('input.status').change(function(e) {
    e.stopPropagation();
    
    var form = $(this).parents('form:first');
    
    // disable 
    $('input.status', form).not(this).prop('checked', false);
    $('input.status', form).not(this).closest('label').removeClass('active');
    
    var post = {
      event_id: $('.event_id', form).val(), 
      status: $('input:checked', form).val()
    };
    // alert(JSON.stringify(post));

    $.post('/watchlist', post, function(data) {
      if($('this').val() == 'watch') {
        // $('#watchlist-btn').addClass('active');
        // $('#status').val('remove');
      } else {
        // $('#watchlist-btn').removeClass('active');
        // $('#status').val('watch');
      }
    });

    return false;
  });

});


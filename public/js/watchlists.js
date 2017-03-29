$(document).ready(function() {
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

    $.post('/watchlist', post, function(data) {});

    return false;
  });

});


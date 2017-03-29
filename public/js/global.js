$(document).ready(function() {
  // apply event filters to tab views
  var filters = {};      
  $('#filters').on('click', '.list-item a', function (e) {
  	e.preventDefault();
  	
  	$(this).closest('.list-nav').find('a').removeClass('active');
  	$(this).addClass('active');
  	
    // pass selected filters to active tab
    $('#filters .active').each(function(){
      var category = $(this).data('cat');
      var filter = $(this).data('filter');        
      filters[category] = filter;
    });

    $('.tab-pane.active').load($('#myTabs .active a').attr("data-url"), $.param(filters));
  });
  
  // load tabs on click
  $('#myTabs a').click(function (e) {
  	e.preventDefault();
  	      
  	var url = $(this).attr("data-url");
  	var href = this.hash;
  	var pane = $(this);
  	
  	// ajax load from data-url
  	$(href).load(url, $.param(filters), function(result){      
  	    pane.tab('show');
  	});
  });

  // load first tab content when document is ready
  $('#all').load($('.active a').attr("data-url"), $.param(filters));
});
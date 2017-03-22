$(document).ready(function() {
  $(function(){
    $('[rel="tooltip"]').tooltip();

    var filters = {};
        
    $('#filters .list-nav a').click(function (e) {
    	e.preventDefault();
    	
    	// remove active class from all other nav links, add it to current
    	$(this).closest('.list-nav').find('a').removeClass('active');
    	$(this).addClass('active');
    	
      // pass selected filters to active tab
      $('#filters .active').each(function(){
        var category = $(this).data('cat');
        var filter = $(this).data('filter');        
        filters[category] = filter;
      });

      // alert(JSON.stringify(filters));
      $('.tab-pane.active').load($('#myTabs .active a').attr("data-url"), $.param(filters));
    });
    
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

    // load first tab content
    $('#all').load($('.active a').attr("data-url"), $.param(filters));
  });
});
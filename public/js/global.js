$(document).ready(function() {
  $(function(){
    $('[rel="tooltip"]').tooltip();
  });

  Date.prototype.toDateInputValue = (function() {
      var local = new Date(this);
      local.setMinutes(this.getMinutes() - this.getTimezoneOffset());
      return local.toJSON().slice(0,10);
  });    
  $('#start_date').val(new Date().toDateInputValue());
});
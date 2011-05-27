var app = $.sammy('.directory', function() {

  this.bind('run', function(e) {
    $('label').inFieldLabels();
    config = {
    	mapCenterLat: 45.5234515,
    	mapCenterLon: -122.6762071,
    	mapStartZoom: 2,
    	baseURL: util.getBaseURL(document.location.pathname)
    };
    
    app.map = mapUtil.createMap(config);
    app.map.fetchDirectory().then(function(directory) {
      util.render('dropdown', 'showbar', {data: directory, append: true});
    })
  })
})

app.site = {config:{}}, 
app.emitter = new util.Emitter();
app.after = {
  dropdown: function() {
    $("#filter_select_1").sSelect();    
  }
}

$(function() {
  app.run();
})
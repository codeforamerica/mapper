var app = $.sammy('#container', function() {

  this.bind('run', function(e) {
    app.config = {
    	mapCenterLat: 45.5234515,
    	mapCenterLon: -122.6762071,
    	mapStartZoom: 2,
    	baseURL: util.getBaseURL(document.location.pathname)
    };
    
    util.render('map', 'container');
  
    app.map
      .fetchDirectory()
      .then(function(directory) {
        util.render('dropdown', 'showbar', {data: directory, append: true});
      })
  })
})

app.site = {config:{}}, 
app.emitter = new util.Emitter();

app.after = {
  map: function() {
    app.map = mapUtil.createMap(app.config);
    $('label').inFieldLabels();
  },
  dropdown: function() {
    $("#filter_select_1").sSelect();    
  }
}

$(function() {
  app.run();
})
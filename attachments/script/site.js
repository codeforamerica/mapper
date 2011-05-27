var app = {
  container: '#container',
  site: {config:{}}, 
  emitter: new util.Emitter(),
  config: {
  	mapCenterLat: 45.5234515,
  	mapCenterLon: -122.6762071,
  	mapStartZoom: 2,
  	baseURL: util.getBaseURL(document.location.pathname)
  }
};

app.sammy = $.sammy(app.container, function() {
  
  this.bind('run', function(e) {    
    
    util.render('map', 'container');
  
    app.map
      .fetchDirectory()
      .then(function(directory) {
        util.render('dropdown', 'showbar', {data: directory, append: true});
      })

  })
  
})

app.after = {
  map: function() {
    
    app.map = mapUtil.createMap(app.config);
    
    $('label', $(app.container)).inFieldLabels();
    
    $('.fullscreen', $(app.container)).click(
      function() {
        $('.directory', $(app.container)).toggleClass('fullscreen');
        app.map.instance.invalidateSize();
      }
    )
    
  },
  dropdown: function() {
    
    $("#filter_select_1", $(app.container)).sSelect();    
    
  }
}

$(function() {
  
  app.sammy.run();
  
})
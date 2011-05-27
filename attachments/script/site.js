var app = $.sammy('.directory', function() {

  this.bind('run', function(e) {
    config = {
    	mapCenterLat: 45.5234515,
    	mapCenterLon: -122.6762071,
    	mapStartZoom: 2,
    	baseURL: util.getBaseURL(document.location.pathname)
    };
    
    var map = mapUtil.createMap(config);
  })
})

app.site = {config:{}}, 
app.emitter = new util.Emitter();

$(function() {
  app.run();
})
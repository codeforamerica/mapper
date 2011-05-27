var mapUtil = function() {
  
  function createMap(config) {
    
    config = $.extend({
      containerId: 'mapContainer'
    }, config)
    
    var container = $('#' + config.containerId);
    
    var cloudmadeUrl = 'http://{s}.tile.cloudmade.com/d3394c6c242a4f26bb7dd4f7e132e5ff/37608/256/{z}/{x}/{y}.png',
  	    cloudmadeAttribution = 'Map data &copy; 2011 OpenStreetMap contributors, Imagery &copy; 2011 CloudMade',
  	    cloudmade = new L.TileLayer(cloudmadeUrl, {maxZoom: 18, attribution: cloudmadeAttribution});
  	    
    var MarkerDot = L.Icon.extend({
      iconUrl: 'style/images/marker-dot.png',
      shadowUrl: 'style/images/marker-shadow.png',
      iconSize: new L.Point(11,11),
      shadowSize: new L.Point(0.0),
      iconAnchor: new L.Point(5,5),
      popupAnchor: new L.Point(-3, -76)
    });
        
    var map = new L.Map(config.containerId, {zoomControl: false});
    
    map.setView(new L.LatLng(config.mapCenterLat, config.mapCenterLon), config.mapStartZoom).addLayer(cloudmade);

    return {
      instance: map,
      container: container,
      config: config,
      markerDot: new MarkerDot(),
      uri: "/" + encodeURIComponent(name) + "/",
      
      showLoader: function() {
        $('.map_header', this.container).first().addClass('loading');
      },

      hideLoader: function() {
        $('.map_header', this.container).first().removeClass('loading');
      },

      showPoint: function(feature) {
        var point = feature.geometry,
            markerLocation = new L.LatLng(parseFloat(point.coordinates[1]), point.coordinates[0]),
            marker = new L.Marker(markerLocation, {icon: this.instance.markerDot});
        marker.properties = feature.properties;
        this.instance.addLayer(marker);
        marker.on('click', function(e){ app.emitter.emit(e.target.properties) })
      },

      fetchDataset: function(name, bbox, callback) {
        this.showLoader();
        $.ajax({
          url: this.config.baseURL + "api/" + name,
          dataType: 'jsonp',
          data: {bbox: this.getBB()},
          success: function( data ){
            $.each(data.features, function(i, feature) {
              map.showPoint(feature);
            })
            app.emitter.bind('data', util.switchInfo);
            this.hideLoader();
          }
        });
      },

      fetchDirectory: function() {
        var ajaxOpts = {
          url: this.config.baseURL + "api/directory",
          dataType: 'json',
          dataFilter: function(data) {
            var data = { 
              options: JSON.parse(data).rows.map(function(item) { 
                return item.value;
              })
            }
            return JSON.stringify(data);
          }
        }
        return $.ajax(ajaxOpts).promise();
      },

      getBB: function(){
        var b = this.instance.getBounds();
        return b._southWest.lng + "," + b._southWest.lat + "," + b._northEast.lng + "," + b._northEast.lat;
      }
    }
  }

  return {
    createMap:createMap
  };
}();
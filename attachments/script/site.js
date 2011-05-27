var config;

var Emitter = function(obj) {
  this.emit = function(obj) { this.trigger('data', obj); };
};
MicroEvent.mixin(Emitter);
var emitter = new Emitter();

$.fn.serializeObject = function() {
    var o = {};
    var a = this.serializeArray();
    $.each(a, function() {
        if (o[this.name]) {
            if (!o[this.name].push) {
                o[this.name] = [o[this.name]];
            }
            o[this.name].push(this.value || '');
        } else {
            o[this.name] = this.value || '';
        }
    });
    return o;
};

var inURL = function(str) {
  var exists = false;
  if ( document.location.pathname.indexOf( str ) > -1 ) {
    exists = true;
  }
  return exists;
}

function render( template, target, data, append ) {
  if ( ! data ) data = {};
  var html = $.mustache( $( "#" + template + "Template" ).html(), data ),
      targetDom = $( "#" + target );
  if( append ) {
    targetDom.append( html );
  } else {
    targetDom.html( html );
  }
  if (template in app) app[template]();
}

function showLoader() {
  $('.map_header').first().addClass('loading');
}

function hideLoader() {
  $('.map_header').first().removeClass('loading');
}

function createMap(config) {
  map = new L.Map('mapContainer', {zoomControl: false});
	var cloudmadeUrl = 'http://{s}.tile.cloudmade.com/d3394c6c242a4f26bb7dd4f7e132e5ff/37608/256/{z}/{x}/{y}.png',
		cloudmadeAttribution = 'Map data &copy; 2011 OpenStreetMap contributors, Imagery &copy; 2011 CloudMade';
	map.cloudmade = new L.TileLayer(cloudmadeUrl, {maxZoom: 18, attribution: cloudmadeAttribution});	
  map.MarkerDot = L.Icon.extend({
    iconUrl: 'style/images/marker-dot.png',
    shadowUrl: 'style/images/marker-shadow.png',
    iconSize: new L.Point(11,11),
    shadowSize: new L.Point(0.0),
    iconAnchor: new L.Point(5,5),
    popupAnchor: new L.Point(-3, -76)
  });
  map.markerDot = new map.MarkerDot();	
}

function showPoint(feature) {
  var point = feature.geometry;
  var markerLocation = new L.LatLng(parseFloat(point.coordinates[1]), point.coordinates[0]);
  var marker = new L.Marker(markerLocation, {icon: map.markerDot});
  marker.properties = feature.properties;
  map.addLayer(marker);
  marker.on('click', function(e){ emitter.emit(e.target.properties) })
}

function fetchDataset(name, bbox, callback) {
  showLoader();
  $.ajax({
    url: config.baseURL + "api/" + name,
    dataType: 'jsonp',
    data: {bbox: getBB()},
    success: function( data ){
      $.each(data.features, function(i, feature) {
        showPoint(feature);
      })
      emitter.bind('data', switchInfo);
      hideLoader();
    }
  });
}

var getBB = function(){
  var b = map.getBounds();
  return b._southWest.lng + "," + b._southWest.lat + "," + b._northEast.lng + "," + b._northEast.lat;
}

var formatMetadata = function(data) {
  out = '<dl>';
  $.each(data, function(key, val) {
    if (typeof(val) == 'string' && key[0] != '_') {
      out = out + '<dt>' + key + '<dd>' + val;
    } else if (typeof(val) == 'object' && key != "geometry" && val != null) {
      if (key == 'properties') {
        $.each(val, function(attr, value){
          out = out + '<dt>' + attr + '<dd>' + value;
        })
      } else {
        out = out + '<dt>' + key + '<dd>' + val.join(', ');
      }
    }
  });
  out = out + '</dl>';
  return out;
}

var switchInfo = function( properties ) {
  $('.sidebar .bottom').html(formatMetadata(properties));
  $('.sidebar .title').text(properties.name);
};

function fetchDirectory(callback) {
  $.getJSON(config.baseURL + "api/directory", function(featureCollection) {
    directory = featureCollection.features;
    directory = { list: directory.map(function(item) { 
      return item.properties;
    }) };
    callback(directory);
  })
}

var app = $.sammy('.directory', function() {

  this.bind('run', function(e) {
    config = {
    	mapCenterLat: 45.5234515,
    	mapCenterLon: -122.6762071,
    	mapStartZoom: 2,
    	baseURL: ""
    };

    if ( inURL('_design') ) {
      if (inURL('_rewrite')) {
        var path = document.location.pathname.split("#")[0];
        if (path[path.length - 1] === "/") {
          config.baseURL = "";
        } else {
          config.baseURL = '_rewrite/';
        }
      } else {
        config.baseURL = '_rewrite/';
      }
    }
    
    createMap();
    map.setView(new L.LatLng(config.mapCenterLat, config.mapCenterLon), config.mapStartZoom).addLayer(map.cloudmade);

    $('.fullscreen').toggle(
      function () {
        $('.directory').addClass('fullscreen');
        map.invalidateSize();
      },
      function () {
        $('.directory').removeClass('fullscreen');
        map.invalidateSize();
      }
    )
  })
})

$(function() {
  app.run();
})
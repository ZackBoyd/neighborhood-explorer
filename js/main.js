var infowindow, map, marker, broomfield, locations;
var markers = [];
  
  // create locations objects in an array to be used in marker functions.
 locations = [{name: "Azitra Restaurant", lat: 39.934668, long: -105.135171, markerNum: 0},{name: "Heaven Dragon Restaurant",lat: 39.939406, long: -105.089853, markerNum: 1},{name: "Corona's Mexican Grill", lat: 39.946250, long: -105.012949, markerNum: 2}, {name: "Zaika Indian Cuisine", lat: 39.920982, long:-105.087010, markerNum: 3}];

 var ExplorerMap = function(){



  broomfield= new google.maps.LatLng(39.925899, -105.132387);
  
  var mapOptions = {
    zoom: 12,
    center: broomfield
  };
  map = new google.maps.Map(document.getElementById('map-canvas'),
      mapOptions);

    google.maps.event.addDomListener(window, "resize", function() {
    var center = map.getCenter();
    google.maps.event.trigger(map, "resize");
    map.setCenter(center); 
});

  infowindow = new google.maps.InfoWindow();
  var i;
  // create marker functions to place markers on map and set up the info window
  for (i = 0; i < locations.length; i++) {
    marker = new google.maps.Marker({
            position: new google.maps.LatLng(locations[i].lat, locations[i].long),
            map: map,
            title: locations[i].name
        });    

        google.maps.event.addListener(marker, 'click', (function(marker)  {
            return function() {

                // set info window with a title and open the info window
                //infowindow.setTitle(marker.title);
                infowindow.setContent(marker.title+"<div id='content'></div>");
                infowindow.open(map, marker);  

              // add marker animation by setting and timing out animation
                marker.setAnimation(google.maps.Animation.BOUNCE);
                setTimeout(function(){ marker.setAnimation(null); }, 750);
                getApi(marker);

                //set up photo api link for specific markers


                //grab the Restaurant image view by getting the id of 
                            
            };
        })(marker));

        markers.push(marker);
  }
};

var ExplorerViewModel = function(){
  var self = this;
  
  // observe the global array of locations
  self.locations= ko.observableArray(locations);

  self.markers=ko.observableArray(markers);

  self.filter= ko.observable('');

  // Create function to open info windows in response to clicks on list-view. 
  self.OpenInfoWindow= function(locations){

    var point= markers[locations.markerNum];

    // set info window with a title and open the info window
     infowindow.open(map, point);
     infowindow.setContent(point.title+"<div id='content'></div>");

     // add marker animation by setting and timing out animation
     point.setAnimation(google.maps.Animation.BOUNCE);
     setTimeout(function(){ point.setAnimation(null); }, 750);

     getApi(point); 

 };
 //Handles the showing and hiding of all markers depending on setMap() value
  self.showOrHideMarkers= function(state){
           for (var i = 0; i < markers.length; i++) {
            markers[i].setMap(state);
          }
        };
// returns array to the filteredmarkers array definition
  self.filterArray = function(filter){
       return ko.utils.arrayFilter(self.locations(), function(location) {
        return location.name.toLowerCase().indexOf(filter) >= 0;                                    
       });
  };
//displays selected markers
  self.displaySelected = function(filteredmarkers){
  for (var i = 0; i < filteredmarkers.length; i++) {
             markers[filteredmarkers[i].markerNum].setMap(map);
            }
      };

//Manages filtering of list view and markers
self.filterList = function(){
var filter = self.filter().toLowerCase();
  if (!filter) {
      self.showOrHideMarkers(map);
     return self.locations();
  } else {

  self.showOrHideMarkers(null);
  var filteredmarkers = [];
  filteredmarkers = self.filterArray(filter);
  self.displaySelected(filteredmarkers);
  return filteredmarkers;

  }
};

};

var getApi = function( marker){

        var $windowContent = $('#content');

        // if ($windowContent) {
        var lat= marker.position.lat();
        var long = marker.position.lng();

        
        /* the foursquare tips api url */
        var url = 'https://api.foursquare.com/v2/venues/search?client_id=' +
            'NFLHHJ350PG5BFEFQB2AZY2CJ3TUCUYR3Q14QPL5L35JT4WR' +
            '&client_secret=WDNBZ4J3BISX15CF1MYOBHBP2RUSF2YSRLVPZ3F' +
            '4WZUYZGWR&v=20130815' + '&ll=' + lat + ',' +
           long + '&query=\'' + marker.title + '\'&limit=1';

  $.getJSON(url, function(response){        

         var venue = response.response.venues[0];
         var venueLoc = venue.contact.formattedPhone;
         var venueAddress = venue.location.formattedAddress;
          var venuePhotoPrefix = venue.categories[0].icon.prefix+'bg'+'_64';
           var venuePhoto = venuePhotoPrefix + venue.categories[0].icon.suffix;
           
        $windowContent.append('<p>'+venueLoc+'</p>');
        $windowContent.append('<p>'+venueAddress+'</p>');
        $windowContent.append('<img src="'+ venuePhoto+'">');   
  }).error(function(e){
    $windowContent.text('Content could not be loaded');

  });

// }

// else{
//        var streetPhoto = 'https://maps.googleapis.com/maps/api/streetview?size=600x400&location='+ address;  

//   $body.append('<img src="'+ streetPhoto + '">');

// }
};
google.maps.event.addDomListener(window, 'load', ExplorerMap);
ko.applyBindings(new ExplorerViewModel());
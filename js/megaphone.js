var neighbourhoods = {};
var geocoder = new google.maps.Geocoder();
var vancouverBounds = new google.maps.LatLngBounds(
    new google.maps.LatLng(49.1989, -123.2654),
    new google.maps.LatLng(49.3145, -123.0193));
    
$.ajax({
    url: 'https://docs.google.com/spreadsheet/pub?key=0Ag9T21YG-5w4dDVuU2JfR2Q4RjRTNHJKYk81aFNMT1E&single=true&gid=0&output=csv',
})
.success(function(data) {
  var vendors = $.csv.toObjects(data);
  $.each(vendors, function(i, vendor) {
    if (typeof neighbourhoods[vendor.Neighbourhood] === 'undefined') {
      neighbourhoods[vendor.Neighbourhood] = [];
    }
    neighbourhoods[vendor.Neighbourhood].push(vendor);
  });
  $.each(neighbourhoods, function(i, neighbourhood) {
    $('#vendors').append('<h2>' + i + '</h2>');
    neighbourhood.sort(function(a, b) {
      return a['Cross Street'] > b['Cross Street'];
    });
    $.each(neighbourhood, function(i, vendor) {
      var $template = $('<li>' + vendor['Vendor'] + ' - ' + vendor['Cross Street'] + ' <a>Show in Map</a></li>');
      $('#vendors').append($template);
      crossStreet2LatLng(vendor['Cross Street'], function(location) {
        var url = 'http://maps.google.com/maps?q=' + location.toUrlValue();
        $template.find('a').attr('href', url);
      });
    });
  });
});

window.addEventListener('load', function() {
    new FastClick(document.body);
}, false);

$(function() {
  $('svg path').click(function() {
    if ($(this).attr('fill') === '#f00') {
      $(this).attr('fill', '#c1c1c1');
    }
    else {
      $(this).attr('fill', '#f00');
    }
  });
  // $('svg').click(function() {
  //   console.log(this);
  //   // $(this).attr('fill', '#f00');
  // });
})

// var paths = document.querySelectorAll('svg');
// for (var i =0; i < paths.length; i++) {

//   paths[i].addEventListener('click', function() {
//     console.log(this);
//     this.attr.fill = '#f00';
//   });
// }

// returns geolocation for cross street
function crossStreet2LatLng(crossStreet, callback) {
  geocoder.geocode( { 'address': crossStreet, 'bounds': vancouverBounds}, function(results, status) {
    if (status == google.maps.GeocoderStatus.OK) {
      callback(results[0].geometry.location);
    } else {
      alert("Geocode was not successful for the following reason: " + status);
    }
  });
}

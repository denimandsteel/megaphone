$(function() {
  var neighbourhoods = {};
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
        $('#vendors').append('<li>' + vendor['Vendor'] + ' - ' + vendor['Cross Street'] + '</li>');
      });
    });
  });

  new FastClick(document.body);

  $('svg path').click(function() {
    if ($(this).attr('fill') === '#f00') {
      $(this).attr('fill', '#c1c1c1');
    }
    else {
      $(this).attr('fill', '#f00');
    }
  });

  if (navigator.geolocation) {
    navigator.geolocation.watchPosition(function(position) {
      $('#latitude').val(position.coords.latitude);
      $('#longitude').val(position.coords.longitude);

      
      var latPercent = (position.coords.latitude - 49.3161)/(49.1962 - 49.3161);
      var lonPercent = (position.coords.longitude + 123.2347)/(-123.0229 + 123.2347);

      $('#current-position').css({ top: (latPercent * 278) + 'px', left: (lonPercent * 320) +'px' });

      $('svg path').each(function(i, path) {
        var top = (latPercent * 278);
        var left = (lonPercent * 320);
        // $(path).
      })
      //-123.2347,49.1962,
      //-123.0229,49.3161

      // $('svg path').attr('fill', '#c1c1c1');
      var nearby = document.querySelectorAll('svg')[0].createSVGRect()
      nearby.x = (lonPercent * 320);
      nearby.y = (latPercent * 278);
      nearby.width = 15;
      nearby.height = 15;
      // document.querySelectorAll('svg')[0].appendChild(nearby); // Exception?
      var list = document.querySelectorAll('svg')[0].getIntersectionList(nearby, null)
      for (var i = 0; i < list.length; i++) {
        // $(list[i]).attr('fill', '#f00');
        $(list[i]).click();
      }

    });
  }

})

$(function() {
  var neighbourhoods = {};
  var hintClicks = [];
  var geocoder = new google.maps.Geocoder();
  var vancouverBounds = new google.maps.LatLngBounds(
    new google.maps.LatLng(49.1989, -123.2654),
    new google.maps.LatLng(49.3145, -123.0193)
  );
    
  $.ajax({
    url: 'https://docs.google.com/spreadsheet/pub?key=0Ag9T21YG-5w4dDVuU2JfR2Q4RjRTNHJKYk81aFNMT1E&single=true&gid=0&output=csv',
  })
  .success(function(data) {
    var vendors = $.csv.toObjects(data);
    $.each(vendors, function(i, vendor) {
      if (vendor.Neighbourhood !== '') {
        if (typeof neighbourhoods[vendor.Neighbourhood] === 'undefined') {
          neighbourhoods[vendor.Neighbourhood] = [];
          // Mark and lighten neighbourhoods that have vendors.
          $('#' + vendor.Neighbourhood).attr('vendored', 'yes').attr('fill', '#b0afa3');
        }
        neighbourhoods[vendor.Neighbourhood].push(vendor);  
      };
    });
  });

  new FastClick(document.body);

  $('svg path').click(function() {
    var neighbourhoodId = $(this).attr('id');
    // Toggle neighbourhood
    if (!neighbourhoods[neighbourhoodId]) return;
    
    if ($(this).attr('class') === 'active') {
      $(this).attr('class', '');
      $(this).attr('fill', '#b0afa3');
      $('#vendors').find('[neighbourhoodId="' + neighbourhoodId + '"]').remove();
    }
    else {
      // TODO: Also check cookie.
      if (hintClicks.indexOf($(this).attr('id')) === -1) {
        hintClicks.push($(this).attr('id'));
      }
      if (hintClicks.length >= 2) {
        $('.hint').addClass('hide');
      }
      $(this).attr('class', 'active');
      $(this).attr('fill', '#eb4859');
      // render neighbourhood template
      var vendors = neighbourhoods[neighbourhoodId];
      var $hoodTemplate = $('<div neighbourhoodId="' + neighbourhoodId + '" class="neighbourhood"><h2>' + toTitleCase(neighbourhoodId.replace('-', ' ')) + '</h2><ul></ul></div>');
      vendors.sort(function(a, b) {
        return a['Cross Street'] > b['Cross Street'];
      });
      $.each(vendors, function(index, vendor) {
        var $template = $([
          '<li>',
            '<h3><em>' + vendor['Vendor'] + '</em>' + (vendor['Location'] !== '' ? ' at ' + vendor['Location']  : '') + '</h3>',
            '<img src="' + vendor['Portrait Path'] + '" alt="" width="220" height="300" class="vendor">',
            '<div class="location">' + vendor['Cross Street'] + '</div>',
            '<a class="maplink">Open in Maps</a>',
            '<div class="times">' + vendor['Hours'] + '</div>',
            '<div class="spotting">',
              '<h4>Where to find ' + vendor['Vendor'] + ':</h4>',
              '<p>' + vendor['Description'] + '</p>',
            '</div>',
          '</li>',
        ].join(''));
        $template.find('h3, .location').click(function() {
          $(this).parent().toggleClass('open');
          if ($(this).parent().hasClass('open')) {
            if (vendor['Cross Street'] && vendor['Cross Street'] !== '') {
              crossStreet2LatLng(vendor['Cross Street'], 0, function(location) {
                var url = 'http://maps.google.com/maps?q=' + location.toUrlValue();
                $template.find('a').attr('href', url);
              });
            }
          }
        });
        $($hoodTemplate.find('ul')).append($template);
      });
      $('#vendors').prepend($hoodTemplate);
    }
    if ($('.neighbourhood').length > 0) {
      $('#vendor-hint').hide();
    }
    else {
      $('#vendor-hint').show();
    }
  });

  if (navigator.geolocation) {
    $('#search').click(function() {
      navigator.geolocation.getCurrentPosition(function(position) {
        var latPercent = (position.coords.latitude - 49.3158)/(49.1961 - 49.3158);
        var lonPercent = (position.coords.longitude + 123.2342)/(-123.0229 + 123.2342);

        $('#current-position').css({ top: (latPercent * 556) + 'px', left: (lonPercent * 640) +'px' }).addClass('active');

        $('svg path').each(function(i, path) {
          var top = (latPercent * 556);
          var left = (lonPercent * 640);
        });

        var nearby = document.querySelectorAll('svg')[0].createSVGRect()
        nearby.x = (lonPercent * 640);
        nearby.y = (latPercent * 556);
        nearby.width = 15;
        nearby.height = 15;
        // document.querySelectorAll('svg')[0].appendChild(nearby); // Exception?
        var list = document.querySelectorAll('svg')[0].getIntersectionList(nearby, null)
        for (var i = 0; i < list.length; i++) {
          if ($(list[i]).attr('class') !== 'active') {
            $(list[i]).click();
          }
        }
      }, function(err) {
        console.log(err);
      });
    });
  }
  else {
    $('#search').hide();
  }

  // From: http://stackoverflow.com/a/196991
  function toTitleCase(str) {
    return str.replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});
  }

  // returns geolocation for cross street
  function crossStreet2LatLng(crossStreet, attempt, callback) {
    geocoder.geocode( { 'address': crossStreet, 'bounds': vancouverBounds}, function(results, status) {
      if (status == google.maps.GeocoderStatus.OK) {
        callback(results[0].geometry.location);
      } else if (status == google.maps.GeocoderStatus.OVER_QUERY_LIMIT && attempt < 5) {
        setTimeout(function(){
          crossStreet2LatLng(crossStreet, attempt++, callback);
        }, 500);
      } else {
        alert("Geocode was not successful for the following reason: " + status);
      }
    });
  }
});

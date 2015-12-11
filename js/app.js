$(function() {
  var neighbourhoods = {};
  var hintClicks = [];
  var featureProduct;
  var onSaleMagazine;
  var iphone = !!navigator.userAgent.match(/iphone/i);
  // var geocoder = new google.maps.Geocoder();
  // var vancouverBounds = new google.maps.LatLngBounds(
  //   new google.maps.LatLng(49.1989, -123.2654),
  //   new google.maps.LatLng(49.3145, -123.0193)
  // );

  if (iphone) {
    $('body').addClass('iphone');
  }
  if (("standalone" in window.navigator) && window.navigator.standalone){
    $('body').addClass('web-app');
    ga('send', 'event', 'visit', 'standalone');
  }
  // if (iphone && window.scrollY === 0) {
  //   window.scrollTo(0,0);
  // }

  $.ajax({
     url: 'https://megaphone-app-staging.herokuapp.com/vendors.json',
  })
  .success(function(data) {
    var vendors = data;
    $.each(vendors, function(i, vendor) {
      $.each(vendor.locations, function(i, location) {
        location.vendor = vendor;
        if (location.neighbourhood !== '') {
          if (typeof neighbourhoods[location.neighbourhood] === 'undefined') {
            neighbourhoods[location.neighbourhood] = [];
            // Mark and lighten serverNeighbourhoods that have vendors.
            $('#' + location.neighbourhood).attr('vendored', 'yes').attr('fill', '#8db6da');
          }
          neighbourhoods[location.neighbourhood].push(location);
        }
      });
    });
  });


  $.ajax({
     url: 'https://megaphone-app-staging.herokuapp.com/products.json',
  })
  .success(function(data) {
    var products = data;
    window.hello = products;
    $.each(products, function(i, product) {  
      if (product.category === "Feature") {
        var featureProductCover = '<img class="ad" src="' + product.image.cover.url + '" alt="' + product.title + '">';
        $('#magazine').prepend(featureProductCover);
      }        
      if (product.category === "Magazine") {
        var magazineCover = '<img src="' + product.image.cover.url + '" alt="' + product.title + '">';
        var magazineDescription = '<h2> Current Issue: ' + product.title + '</h2><p>' + product.description + '</p><br>';  
        $('#magazine').append(magazineCover);
        $('#intro').prepend(magazineDescription);
      }       
    });
  });

  new FastClick(document.body);

  $('svg path').click(function() {
    var neighbourhoodId = $(this).attr('id');
    var myHoods = $.cookie('my_hoods') ? JSON.parse($.cookie('my_hoods')) : [];
    ga('send', 'event', 'button', 'click', neighbourhoodId);
    // Toggle neighbourhood
    if (!neighbourhoods[neighbourhoodId]) return;

    if ($(this).attr('class') === 'active') {
      $(this).attr('class', '');
      $(this).attr('fill', '#8db6da');
      $('#vendors').find('#neighbourhood-' + neighbourhoodId).remove();
      
      // remove neighborhood from cookie
      var removeIndex = myHoods.indexOf(neighbourhoodId);
      if (removeIndex > -1) {
        myHoods.splice(removeIndex, 1);
        $.cookie('my_hoods', JSON.stringify(myHoods));  
      }
    }
    else {
      // TODO: Also check cookie.
      if (hintClicks.indexOf($(this).attr('id')) === -1) {
        hintClicks.push($(this).attr('id'));
      }
      if (hintClicks.length >= 2) {
        $('.hint').addClass('hide');
      }
      
      selectNeighourhoodWithId(neighbourhoodId);
      
      // add neighbourhood to the cookie
      myHoods.push(neighbourhoodId);
      jQuery.unique(myHoods);
      $.cookie('my_hoods', JSON.stringify(myHoods));
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
      ga('send', 'event', 'button', 'click', 'vendors near me');
      navigator.geolocation.getCurrentPosition(function(position) {
        var latPercent = null, lonPercent = null;
        if ($('body').hasClass('vancouver')) {
          latPercent = (position.coords.latitude - 49.3158)/(49.1961 - 49.3158);
          lonPercent = (position.coords.longitude + 123.2342)/(-123.0229 + 123.2342);
        }
        else {
          latPercent = (position.coords.latitude - 48.4542)/(48.3994 - 48.4542);
          lonPercent = (position.coords.longitude + 123.4055)/(-123.3128 + 123.4055);
        }

        $('#current-position').css({ top: (latPercent * 556) + 'px', left: (lonPercent * 640) +'px' }).addClass('active');

        var nearby = document.querySelectorAll('svg.' + $('body').attr('class'))[0].createSVGRect();
        nearby.x = (lonPercent * 640);
        nearby.y = (latPercent * 556);
        nearby.width = 60;
        nearby.height = 60;
        // document.querySelectorAll('svg.' + $('body').attr('class'))[0].appendChild(nearby); // Exception?
        var list = document.querySelectorAll('svg.' + $('body').attr('class'))[0].getIntersectionList(nearby, null);
        for (var i = 0; i < list.length; i++) {
          if ($(list[i]).attr('class') !== 'active') {
            $(list[i]).click();
          }
        }
      }, function(err) {
        ga('send', 'event', 'geolocation', 'fail', err.message);
      });
    });
  }
  else {
    $('#search').hide();
  }

  $('.go-to-home').click(function() {
    $('#home').show();
    $('#find').hide();
    window.scrollTo(0, 0);
    return false;
  });

  $('.go-to-find').click(function() {
    $('#home').hide();
    $('#find').show();

    // Show map by city.
    var city = $(this).attr('id').replace('-switch', '');
    $('body').attr('class', city);

    if ($(this).hasClass('switch')) {
      $('#vendors .neighbourhood').remove();
      $('#vendor-hint').show();
      $('path.active').click();
    }
    else {
      // Mark my neighbourhoods from cookie
      var myHoods = $.cookie('my_hoods') ? JSON.parse($.cookie('my_hoods')) : [];
      jQuery.unique(myHoods);
      $.each(myHoods, function(i, hoodId) {
        selectNeighourhoodWithId(hoodId);
      });
    }
    window.scrollTo(0, 0);
    return false;
  });

  $('#about-megaphone-finder').click(function() {
    ga('send', 'event', 'button', 'click', 'about');
    $('#about').toggle();
    return false;
  });

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
        ga('send', 'event', 'geocoder', 'fail', status);
      }
    });
  }

  // toggles a neighbourhood
  function selectNeighourhoodWithId(neighbourhoodId) {
    if (!neighbourhoods[neighbourhoodId]) return;
    
    $('#' + neighbourhoodId).attr('class', 'active');
    $('#' + neighbourhoodId).attr('fill', '#eb4859');
    // render neighbourhood template
    var locations = neighbourhoods[neighbourhoodId];
    var $hoodTemplate = $('<div id="neighbourhood-' + neighbourhoodId + '" class="neighbourhood"><h2>' + toTitleCase(neighbourhoodId.replace('-', ' ')) + '</h2><ul></ul></div>');
    locations.sort(function(a, b) {
      return a.cross_street > b.cross_street;
    });
    $.each(locations, function(index, location) {
      var $template = $([
        '<li>',
          '<h3><em>' + location.vendor.name + '</em>' + (location.name !== null ? ' at ' + location.name  : '') + '</h3>',
          '<div class="info">',
            '<img src="' + location.vendor.image.profile.url + '" alt="" class="vendor">',
            '<div class="location">' + location.cross_street + '</div>',
            '<a href="http://maps.apple.com/maps?q=' + location.cross_street + ', ' + toTitleCase($('body').attr('class')) + ', BC, Canada" class="maplink button">Open in Maps</a>',
            '<div class="times">' + location.hours + '</div>',
            '<div class="spotting">',
              '<h4>Where to find ' + location.vendor.name + ':</h4>',
              '<p>' + location.description + '</p>',
            '</div>',
          '</div>',
        '</li>',
      ].join(''));

      $template.click(function(e) {
        if ($(this).hasClass('open') && $(e.target).is('h3')) {
          $(this).removeClass('open');
        }
        else if (!$(this).hasClass('open')) {
          ga('send', 'event', 'button', 'click', location.vendor.name);
          $(this).addClass('open');
          if (false && location.cross_street && location.cross_street !== '') {
            crossStreet2LatLng(location.cross_street, 0, function(location) {
              var url = 'http://maps.google.com/maps?q=' + location.toUrlValue();
              $template.find('a').attr('href', url);
              // ?? http://developer.apple.com/library/ios/#featuredarticles/iPhoneURLScheme_Reference/Articles/MapLinks.html
            });
          }
        }
      });

      $template.find('a.maplink').click(function() {
        ga('send', 'event', 'button', 'click', 'open in maps');
      });

      $($hoodTemplate.find('ul')).append($template);
    });
    $('#vendors').prepend($hoodTemplate);

  }
});

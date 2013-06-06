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

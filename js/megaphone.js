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
    $('#list').append('<h2>' + i + '</h2>');
    neighbourhood.sort(function(a, b) {
      return a['Cross Street'] > b['Cross Street'];
    });
    $.each(neighbourhood, function(i, vendor) {
      $('#list').append('<div>' + vendor['Vendor'] + ' - ' + vendor['Cross Street'] + '</div>');
    });
  });
});

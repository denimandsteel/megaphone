var neighbourhoods = {};
$.ajax({
    url: 'https://docs.google.com/spreadsheet/pub?key=0Ag9T21YG-5w4dDVuU2JfR2Q4RjRTNHJKYk81aFNMT1E&single=true&gid=0&output=csv',
})
.success(function(data) {
  var vendors = $.csv.toObjects(data);
  $.each(vendors, function(i, vendor) {
    // console.log(vendor);
    $('#list').append('<div>' + vendor.Vendor + '</div>');
    if (typeof neighbourhoods[vendor.Neighbourhood] === 'undefined') {
      neighbourhoods[vendor.Neighbourhood] = [];
    }
    neighbourhoods[vendor.Neighbourhood].push(vendor);
  });
});

// main.js
$.ajax({
  url: "https://maps.googleapis.com/maps/api/distancematrix/json",
  type: "GET",
  data: {
    origins: $("#origin").val(),
    destination: $("#destinations").val(),
    mode: "driving",
    key: "AIzaSyBZWROu2McODk1fFeC1BZsiIcQ6T1yLB5o"
  },
  success: function(data) {
    console.log(data);
  }
});


// --------------------------------------------------------------------------------------- BEGIN Auto-Complete Form
// Google API auto-complete address form with geo-location assist
var placeSearch, autocomplete;
var componentForm = {
  street_number: 'short_name',
  route: 'long_name',
  locality: 'long_name',
  administrative_area_level_1: 'short_name',
  country: 'long_name',
  postal_code: 'short_name'
};

function initAutocomplete() {
  autocomplete = new google.maps.places.Autocomplete(
      /** @type {!HTMLInputElement} */(document.getElementById('autocomplete')),
      {types: ['geocode']});
  autocomplete.addListener('place_changed', fillInAddress);
}

function fillInAddress() {
  var place = autocomplete.getPlace();
  for (var component in componentForm) {
    document.getElementById(component).value = '';
    document.getElementById(component).disabled = false;
  }

  for (var i = 0; i < place.address_components.length; i++) {
    var addressType = place.address_components[i].types[0];
    if (componentForm[addressType]) {
      var val = place.address_components[i][componentForm[addressType]];
      document.getElementById(addressType).value = val;
    }
  }
}

function geolocate() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(function(position) {
      var geolocation = {
        lat: position.coords.latitude,
        lng: position.coords.longitude
      };
      var circle = new google.maps.Circle({
        center: geolocation,
        radius: position.coords.accuracy
      });
      autocomplete.setBounds(circle.getBounds());
    });
  }
}
// --------------------------------------------------------------------------------------- END Auto-Complete Form
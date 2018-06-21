var config = {
    apiKey: "AIzaSyCjw3ZOOzTjEiAs4FX0yVvnevh06UwoeMs",
    authDomain: "fudmeh.firebaseapp.com",
    databaseURL: "https://fudmeh.firebaseio.com",
    projectId: "fudmeh",
    storageBucket: "",
    messagingSenderId: "426120982640"
};
firebase.initializeApp(config);

// Create a variable to reference the database
var database = firebase.database();

//  Create variables for latitude and longitude
let lat = "";
let lon = "";

//  Pull users lat and longitude from firebase
database.ref('location').on('value', function(snapshot){
    lat = snapshot.val().lat;
    lon = snapshot.val().lng;

//  Create variable holding the search url including parameters
    let queryURL = "https://developers.zomato.com/api/v2.1/search?lat=" + lat + "&lon=" + lon + "&radius=10&sort=real_distance&count=25&cuisines=chinese";

//  AJAX call to Zomato
$.ajax({
    url: queryURL,
    method: 'GET',
    headers : {
        'Accept': 'application/json',
        'user-key': 'faf6b95bf12c6d16066378598f219943'
    }
}).then(function (response) {
    //  Calling the zomato JSON information manipulation
    zomato(response);
})

//  Create function to handle zomato JSON
function zomato(x){
    //  Console log the zomato JSON to manipulate
    console.log(x);

    //  Iterate through the JSON retrived from zomato
    //  Push zomato JSON to firebase
    for(var i = 0; i < x.results_shown; i++){
        database.ref('fuudMeh').push({
            name: x.restaurants[i].restaurant.name,
            img: x.restaurants[i].restaurant.photos_url,
            url: x.restaurants[i].restaurant.url,
            location: x.restaurants[i].restaurant.location,
            id: x.restaurants[i].restaurant.id,
            cuisines: x.restaurants[i].restaurant.cuisines
            })

        var restaurant = {
            category: x.restaurants[i].restaurant.cuisines,
            lat: x.restaurants[i].restaurant.location.latitude,
            lng: x.restaurants[i].restaurant.location.longitude,
            object: {
                name: x.restaurants[i].restaurant.name,
                address: x.restaurants[i].restaurant.location.address,
                suburb: x.restaurants[i].restaurant.location.locality,
                postcode: x.restaurants[i].restaurant.location.zipcode,
                url: x.restaurants[i].restaurant.url,
                map: x.restaurants[i].restaurant.location.address
                }    
            }
    console.log(restaurant)
    
    }


}

});

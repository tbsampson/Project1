let lat = "29.7325483";
let lon = "-95.5512395"

let queryURL = "https://developers.zomato.com/api/v2.1/search?lat=" + lat + "&lon=" + lon + "&radius=10&sort=real_distance";


$.ajax({
    url: queryURL,
    method: 'GET',
    headers : {
        'Accept': 'application/json',
        'user-key': 'faf6b95bf12c6d16066378598f219943'
    }
}).then(function (response) {
    //  console.log to find pathways
    console.log(response);
})



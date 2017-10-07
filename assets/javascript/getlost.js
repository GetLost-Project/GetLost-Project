var config = {
    apiKey: "AIzaSyBFg7KlfRZ5iZs2XehOSdGYe8SSs0fsnKg",
    authDomain: "getlost-5e0a8.firebaseapp.com",
    databaseURL: "https://getlost-5e0a8.firebaseio.com",
    projectId: "getlost-5e0a8",
    storageBucket: "getlost-5e0a8.appspot.com",
    messagingSenderId: "587942997996"
};
firebase.initializeApp(config);

var database = firebase.database();
//Login/SignIn Elements
var auth = firebase.auth();
var txtEmail = $("#txt-email");
var txtPassword = $("#txt-password")
var signUpPage = $("#signUpPage")
var txtDisplay = $("#txt-display")
var txtName = $("#txt-name")
var txtLocation = $("#txt-location")
var profileImage = $("#profile-image")
var btnLogin = $("#btnLogin");
var btnSignUp = $("#btnSignUp");
var btnLogOut = $("#btnLogOut");
var btnSignUpEntry = $("#btnSignUpEntry");
var modalOpen = $("#modalOpen")
var loggedIn;

// Information Recieved From Login
var username;
var userId;
var profilePic;
var userLocation;

//Login/SignUp Click Functions
modalOpen.on("click", e => {
    signUpPage.hide();
    btnSignUpEntry.hide();
    btnSignUp.show();
    btnLogin.show();
    $("#error").html("")
})
//Login Event
btnLogin.on("click", e => {
    var email = txtEmail.val();
    var password = txtPassword.val();
    var auth = firebase.auth();

    var promise = auth.signInWithEmailAndPassword(email, password);

    promise.catch(e => $("#error").html(e.message));
});

btnSignUp.on("click", e => {
    signUpPage.show();
    btnSignUpEntry.show();
    btnSignUp.hide();
    btnLogin.hide();
})
//Sign Up Event
btnSignUpEntry.on("click", e => {
    //TODO: CHECK FOR REAL EMAIL
    //TODO MAKE SURE BOTH FIELDS ARE VALID
    var email = txtEmail.val();
    var password = txtPassword.val();
    var displayName = txtDisplay.val().trim();
    var name = txtName.val();
    var location = txtLocation.val();
    var profilePic = profileImage.val();

    auth = firebase.auth();

    var promise = auth.createUserWithEmailAndPassword(email, password).then(function(user) {


        firebase.database().ref('users/userID: ' + user.uid).set({
            displayName: displayName,
            name: name,
            location: location,
            profilePic: profilePic

        })
    });


    promise.catch(e => $("#error").html(e.message));
})

//Log Out Event
btnLogOut.on("click", function logOut() {
    firebase.auth().signOut();
    location.reload();
})

//Authentication Listener
firebase.auth().onAuthStateChanged(firebaseUser => {
    $("#myModal").modal("hide")
    if (firebaseUser) {
        console.log("logged-in");
        loggedIn = true
        modalOpen.addClass("hide");
        btnLogOut.removeClass("hide")
        $("#nearYou").removeClass("hide");
        userId = firebase.auth().currentUser.uid
        return firebase.database().ref('users/userID: ' + userId).once('value').then(function(snapshot) {
            username = snapshot.val() && snapshot.val().displayName;
            profilePic = snapshot.val().profilePic;
            userLocation = snapshot.val().location;

        }).then(function() {
            userSearch = userLocation
            geoTrailWeatherAPI();
            userProfile();
        })



    } else {
        console.log("not logged in")
        loggedIn = false
        btnLogOut.addClass("hide")
        modalOpen.removeClass("hide");
        $("#nearYou").addClass("hide");

    }
});
var test1;
$("#test").on("click", function test() {
    console.log(username)
    console.log(userId)
    console.log(profilePic)
    console.log(userLocation)
    $("#profile-picture").html("<img src='" + profilePic + "'>")
})


// Search event
var userSearch;
var userDistance = 100;
//Google Maps API
function initMap() {
    var uluru = { lat: -25.363, lng: 131.044 };
    var map = new google.maps.Map($("#map")[0], {
        zoom: 4,
        center: uluru
    });
    var marker = new google.maps.Marker({
        position: uluru,
        map: map
    });
};
// Google Maps Geolocation AJAX
function geoTrailWeatherAPI() {
    console.log(userSearch);
    console.log(userDistance);
    var geolocationURL = "https://maps.googleapis.com/maps/api/geocode/json?address=" + userSearch + "&key=AIzaSyAmNX29rk_tbFqoDWIyYCg5TglI2OP8Xnk";

    $.ajax({
        url: geolocationURL,
        method: "GET"
    }).done(function(response) {
        var searchCoordinates = response.results[0].geometry.location
        var lat = searchCoordinates.lat
        var lon = searchCoordinates.lng

        //REI Trail API AJAX
        var trailURL = "https://www.hikingproject.com/data/get-trails?lat=" + lat + "4&lon=" + lon + "&maxDistance=" + userDistance + "&maxResults=5&key=200161300-d760842c6aa8785c2fc55d5c8a01cc6a"

        $.ajax({
            url: trailURL,
            method: "GET"
        }).done(function(response) {
            console.log(response)
            for (var i = 0; i < response.trails.length; i++) {
                //console.log(response.trails[i])
                //TODO make variables for image, summary, difficulty, length, name, condition, location, accent
                var lat = response.trails[i].latitude
                var lon = response.trails[i].longitude
                var imgSmall = response.trails[i].imgSqSmall
                var trailName = response.trails[i].name
                var trailSummary = response.trails[i].summary

                var card = $("<div class='col-lg-2' id='card'>");
                var a = $("<img id='thumbnail' src='" + imgSmall + "' alt='No Image'' height='150px' width='150px' border-radius='30px'>")
                var b = $("<div class='caption'>")
                var c = $("<h3>" + trailName + "</h3>")
                var d = $("<p>" + trailSummary + "</p>")
                var e = $("<p><a href='#' id='favorite' role='button'><i class='fa fa-star-o' aria-hidden='true'></i></a></p>")
                card.append(a);
                card.append(b);
                card.append(c);
                card.append(d);
                card.append(e);

                $("#search-display").append(card)

                //WeatherUnderground API AJAX
                function weather() {
                    var weatherURL = "http://api.wunderground.com/api/5bb60ec58c2a2733/conditions/geolookup/q/" + lat + "," + lon + ".json"

                    $.ajax({
                        url: weatherURL,
                        method: "GET"
                    }).done(function(response) {
                        //TODO make variables for temp, icon, 
                        var currentTemp = response.current_observation.temp_f
                        e = $("<p>" + currentTemp + "</p>")

                        console.log(response)

                    });
                }
            }
            //WeatherUnderground Radar API AJAX
            var radarURL = "http://api.wunderground.com/api/5bb60ec58c2a2733/radar/image.gif?centerlat=38&centerlon=-96.4&radius=100&width=280&height=280&newmaps=1"
            $.ajax({
                url: radarURL,
                method: "GET"
            }).done(function(response) {
                console.log(response)
                //$("#weather").append(response)

            })

        });
    });
}

$("#btnSearch").on("click", function search() {
    $("#search-display").html("");
    userSearch = $("#userSearch").val();
    userDistance = $("#userDistance").val();
    $("#nearYou").addClass("hide");
    $("#results").removeClass("hide");
    geoTrailWeatherAPI();

});
function userProfile(){
    $("#profile-box").removeClass("hide")
    $("#username").html("<h3>"+username+"</h3>")
}
//Append Results

//Append Search
//Firebase Config
var config = {
    apiKey: "AIzaSyBFg7KlfRZ5iZs2XehOSdGYe8SSs0fsnKg",
    authDomain: "getlost-5e0a8.firebaseapp.com",
    databaseURL: "https://getlost-5e0a8.firebaseio.com",
    projectId: "getlost-5e0a8",
    storageBucket: "getlost-5e0a8.appspot.com",
    messagingSenderId: "587942997996"
};
firebase.initializeApp(config);

var storageRef = firebase.storage().ref();

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
var userId;
var userLocation;
var newUser = false;

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


btnSignUpEntry.on("click", e => {
    var email = txtEmail.val();
    var password = txtPassword.val();
    var displayName = txtDisplay.val().trim();
    var name = txtName.val();
    var location = txtLocation.val();
    userSearch = location;

    auth = firebase.auth();


    var promise = auth.createUserWithEmailAndPassword(email, password).then(function(user) {

        var profilePicPath = document.getElementById("profile-image").files[0]
        var task = storageRef.child("images").put(profilePicPath);

        newUser = true;
        task.on(firebase.storage.TaskEvent.STATE_CHANGED,
            function(snapshot) { console.log("state " + snapshot.state) },
            function(error) { console.log("error " + error) },
            function() {
                var profilePic = task.snapshot.downloadURL;

                userProfile(displayName, profilePic, name);

                firebase.database().ref('users/userID: ' + user.uid).set({
                    displayName: displayName,
                    name: name,
                    location: location,
                    profilePic: profilePic,
                    favorites: {}

                })

            }
        )
    })

    promise.catch(e => $("#error").html(e.message));
})

//Log Out Event
btnLogOut.on("click", function logOut() {
    firebase.auth().signOut();
    location.reload();
})

//Authentication Listener
firebase.auth().onAuthStateChanged(firebaseUser => {
    var username;
    var profilePic;
    $("#myModal").modal("hide")
    if (firebaseUser) {
        console.log("logged-in");
        loggedIn = true
        modalOpen.addClass("hide");
        btnLogOut.removeClass("hide");
        $("#results").addClass("hide");
        $("#noUser").addClass("hide");
        $("#nearYou").removeClass("hide");
        $("#second-page").removeClass("hide");
        $("#third-page").removeClass("hide");
        $("#greeting").removeClass("hide");

        userId = firebaseUser.uid
        return firebase.database().ref('users/userID: ' + userId).once('value').then(function(snapshot) {
            console.log(snapshot.val())
            username = snapshot.val() && snapshot.val().displayName;
            name = snapshot.val().name;

            if (newUser) {
                newUser = false
            } else {
                profilePic = snapshot.val().profilePic;
                userSearch = snapshot.val().location;
                userProfile(username, profilePic, name);

            }

            geoTrailWeatherAPI();
            displayFavorites();
            stats();

        })



    } else {
        console.log("not logged in");
        loggedIn = false;
        btnLogOut.addClass("hide");
        modalOpen.removeClass("hide");
        $("#nearYou").addClass("hide");
        $("#second-page").addClass("hide");
        $("third-page").addClass("hide");
        $("#greeting").addClass("hide");

    }
});
var test1;
$("#test").on("click", function test() {
    console.log(mapArray);

})


// Search event
var userSearch;
var userDistance = 100;
var trailDeck = [];


// Google Maps Geolocation AJAX
function geoTrailWeatherAPI() {
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
            for (let i = 0; i < response.trails.length; i++) {

                //TODO make variables for condition, 

                var lat = response.trails[i].latitude;
                var lon = response.trails[i].longitude;
                var imgSmall = response.trails[i].imgSqSmall;
                var imgMed = response.trails[i].imgSmall;
                var trailWeb = response.trails[i].url;
                var trailName = response.trails[i].name;
                var trailSummary = response.trails[i].summary;
                var trailLength = response.trails[i].length;
                var trailAscent = response.trails[i].ascent;
                var trailRating = response.trails[i].stars;
                var trailLocation = response.trails[i].location;
                var trailDifficulty = response.trails[i].difficulty;
                if (trailDifficulty === "green") {
                    trailDifficulty = "assets/images/green.svg"
                }
                if (trailDifficulty === "greenBlue") {
                    trailDifficulty = "assets/images/greenBlue.svg"
                }
                if (trailDifficulty === "blue") {
                    trailDifficulty = "assets/images/blue.svg"
                }
                if (trailDifficulty === "blueBlack") {
                    trailDifficulty = "assets/images/blueBlack.svg"
                }
                if (trailDifficulty === "black") {
                    trailDifficulty = "assets/images/black.svg"
                }
                if (trailDifficulty === "dblack") {
                    trailDifficulty = "assets/images/dblack.svg"
                }

                var currentTemp;
                var weatherIcon;

                var card = $("<div class='col-lg-2' id='card'>");
                var a = $("<img id='thumbnail' src='" + imgSmall + "' alt='Please Upload a Photo <a href=" + trailWeb + ">HERE</a>' height='150px' width='150px' border-radius='30px'>")
                var b = $("<h3>" + trailName + "</h3>")
                var c = $("<h5>" + trailLocation + "</h5>")
                var d = $("<p>" + trailSummary + "</p>")
                var e = $("<p class='trailInfo'>Length: " + trailLength + " miles</p>")
                var f = $("<p class='trailInfo'>Ascent: " + trailAscent + " ft.</p>")
                var g = $("<p class='trailInfo'>Rating: " + trailRating + "/5</p>")
                var h = $("<p class='trailInfo'>Difficulty: <img src='" + trailDifficulty + "'width='20px' height='20px'></p>")
                var x = $("<p class='trailInfo' id='currentTemp" + [i] + "'>Current Temp: </p>")
                var y = $("<p class='trailInfo' id='weatherIcon" + [i] + "'>Current Weather: </p>")
                var z = $("<div class='favoriteBtn' value='" + i + "' role='button'><i onclick='changeStar(this)' class='fa fa-star-o'></i></div>")
                card.append(a);
                card.append(b);
                card.append(c);
                card.append(d);
                card.append(e);
                card.append(f);
                card.append(g);
                card.append(h);
                card.append(x);
                card.append(y);
                card.append(z);

                $("#search-display").append(card);


                weather(lat, lon, $("#currentTemp" + [i]), $("#weatherIcon" + [i]));



                var trailCard = {
                    lat: lat,
                    lon: lon,
                    trailName: trailName,
                    img: imgMed,
                    web: trailWeb,
                    summary: trailSummary,
                    length: trailLength,
                    ascent: trailAscent,
                    rating: trailRating,
                    difficulty: trailDifficulty,
                    location: trailLocation,
                }

                trailDeck.push(trailCard)

            }


        });
    });
}

//Weather API
function weather(lat, lon, tempElem, weatherIconElem) {
    var weatherURL = "http://api.wunderground.com/api/4a1ff17d8c148703/conditions/geolookup/q/" + lat + "," + lon + ".json"

    $.ajax({
        url: weatherURL,
        method: "GET"
    }).done(function(response) {
        currentTemp = response.current_observation.temp_f;
        weatherIcon = response.current_observation.icon_url;
        tempElem.append(currentTemp);
        weatherIconElem.append("<img src ='" + weatherIcon + "'>");


    });
}


// Search Sent to APIs
$("#btnSearch").on("click", function search() {
    $("#search-display").html("");
    userSearch = $("#userSearch").val();
    userDistance = $("#userDistance").val();
    $("#noUser").addClass("hide");
    $("#nearYou").addClass("hide");
    $("#results").removeClass("hide");
    geoTrailWeatherAPI();
    trailDeck = [];

});
//clock
function startTime() {
    var time = moment().format('HH:mm:ss');
    $('#clock').html("<div>Current Time:"+time+"</div>");
    setTimeout(startTime, 1000);
}

$(document).ready(function() {
    startTime();
});
// User Profile Load
function userProfile(username, profilePic, name) {
    $("#profile-box").removeClass("hide")
    $("#username").html("<h3 id='username'>" + username + "</h3>")
    $("#profile-picture").html("<img src='" + profilePic + "'>")
    $("#greeting").html("<div>Hello "+name+"!</div>")

};
//Change Stars to show favorites
function changeStar(favoriteStar) {
    favoriteStar.classList.add("fa-star");
    favoriteStar.classList.remove("fa-star-o");
}

// Send to favorites database on star click
$("body").on("click", ".favoriteBtn", function createFavorite() {
    database.ref('users/userID: ' + userId + '/favorites').push({
        trail: trailDeck[parseInt($(this).attr("value"))]
    })

    this.disabled = true
    displayFavorites();
})

//Get favorites back from database and display them
var favoritesKeys;
var favoritesDeck = [];

function displayFavorites() {
    database.ref('users/userID: ' + userId + '/favorites/').once('value').then(function(snapshot) {
        favoritesKeys = Object.keys(snapshot.val())
    }).then(function favoritesData() {
        favoritesDeck = []
        $("#favorites").html("")
        for (var i = 0; i < favoritesKeys.length; i++) {
            var key = favoritesKeys[i];
            appendFavorites(i, key);

        }

    })
}

function appendFavorites(i, key) {
    database.ref('users/userID: ' + userId + '/favorites/' + key).once('value').then(function(snapshot) {
        var trailName = snapshot.val().trail.trailName;
        var imgMed = snapshot.val().trail.img;
        var lat = snapshot.val().trail.lat;
        var lon = snapshot.val().trail.lon;
        var site = snapshot.val().trail.web;
        var summary = snapshot.val().trail.summary;
        var length = snapshot.val().trail.length;
        var ascent = snapshot.val().trail.ascent;
        var rating = snapshot.val().trail.rating;
        var difficulty = snapshot.val().trail.difficulty;
        var location = snapshot.val().trail.location;


        var favoriteCard = $("<div class='col-lg-10' id='favoriteCard'>");
        var a = $("<img class='col-lg-4' id='favThumbnail' src='" + imgMed + "' alt='Please Upload a Photo <a href=" + site + ">HERE</a>' height='auto' width='auto' border-radius='30px'>");
        var b = $("<h2 class='favoriteInfo col-lg-6'>" + trailName + "</h2>");
        var c = $("<h4 class='favoriteInfo col-lg-6'>" + location + "</h4>");
        var d = $("<p class='favoriteInfo col-lg-6'>" + summary + "</p>");
        var e = $("<p>Latitude: " + lat + "</p>");
        var f = $("<p>Longitude: " + lon + "</p>");
        var g = $("<p>Length: " + length + "</p>");
        var h = $("<p>Ascent: " + ascent + "</p>");
        var j = $("<p>Rating: " + rating + "/5</p>");
        var k = $("<p>Difficulty: <img src='" + difficulty + "'width='20px' height='20px'></p>");
        var l = $("<a target='_blank' href='" + site + "'>Trail Map</a>")
        var w = $("<p id='favoriteCurrentTemp" + [i] + "'>Current Temp: </p>");
        var x = $("<p id='favoriteWeatherIcon" + [i] + "'>Current Weather: </p>");
        var y = $("<button class='hiked btn btn-info' value='" + i + "'>Hiked</button>");
        var z = $("<button class='removeFav btn btn-info' value='" + i + "'>Remove</button>");

        favoriteCard.append(a);
        favoriteCard.append(b);
        favoriteCard.append(c);
        favoriteCard.append(d);
        favoriteCard.append(e);
        favoriteCard.append(f);
        favoriteCard.append(g);
        favoriteCard.append(h);
        favoriteCard.append(j);
        favoriteCard.append(k);
        favoriteCard.append(l);
        favoriteCard.append(w);
        favoriteCard.append(x);
        favoriteCard.append(y);
        favoriteCard.append(z);

        $("#favorites").prepend(favoriteCard)

        weather(lat, lon, $("#favoriteCurrentTemp" + [i]), $("#favoriteWeatherIcon" + [i]));

        var favoriteCard = {
            trailName: trailName,
            imgMed: imgMed,
            lat: lat,
            lon: lon,
            site: site,
            summary: summary,
            length: length,
            ascent: ascent,
            rating: rating,
            difficulty: difficulty,
            location: location
        }

        favoritesDeck.push(favoriteCard)
    });
};


var lifetimeDistance = 0;
var lifetimeClimbed = 0;
var lifetimeGreen = 0;
var lifetimeGreenBlue = 0;
var lifetimeBlue = 0;
var lifetimeBlueBlack = 0;
var lifetimeBlack = 0;
var lifetimeDBlack = 0;
var statDeck = [];

$("body").on("click", ".removeFav", function remove() {
    var removeKey = favoritesKeys[$(this).attr("value")];
    database.ref('users/userID: ' + userId + '/favorites/' + removeKey).remove().then(displayFavorites());

})

$("body").on("click", ".hiked", function hiked() {
    var hikedTrail = favoritesDeck[parseInt($(this).attr("value"))];
    var hikedName = hikedTrail.trailName;
    var hikedLat = hikedTrail.lat;
    var hikedLon = hikedTrail.lon;
    var hikedDistance = hikedTrail.length;
    var hikedClimb = hikedTrail.ascent;
    var hikedDifficulty = hikedTrail.difficulty;
    console.log(hikedTrail)

    lifetimeDistance = lifetimeDistance + hikedDistance;
    lifetimeClimbed = lifetimeClimbed + hikedClimb;
    if (hikedDifficulty === "assets/images/green.svg") {
        lifetimeGreen++
    }
    if (hikedDifficulty === "assets/images/greenBlue.svg") {
        lifetimeGreenBlue++
    }
    if (hikedDifficulty === "assets/images/blue.svg") {
        lifetimeBlue++
    }
    if (hikedDifficulty === "assets/images/blueBlack.svg") {
        lifetimeBlueBlack++
    }
    if (hikedDifficulty === "assets/images/black.svg") {
        lifetimeBlack++
    }
    if (hikedDifficulty === "assets/images/dblack.svg") {
        lifetimeDBlack++
    }
    database.ref('users/userID: ' + userId + '/hiked').push({

        hikedName: hikedName,
        hikedLon: hikedLon,
        hikedLat: hikedLat,
        hikedDistance: hikedDistance,
        hikedClimb: hikedClimb,
        hikedDifficulty: hikedDifficulty
    })
    appendStats();
})

var hikedKeys;

function stats() {
    database.ref('users/userID: ' + userId + '/hiked/').once('value').then(function(snapshot) {
        hikedKeys = Object.keys(snapshot.val())
    }).then(function() {
        lifetimeDistance = 0;
        lifetimeClimbed = 0;
        lifetimeGreen = 0;
        lifetimeGreenBlue = 0;
        lifetimeBlue = 0;
        lifetimeBlueBlack = 0;
        lifetimeBlack = 0;
        lifetimeDBlack = 0;

        getStats()
    });

};

function getStats() {
    for (var i = 0; i < hikedKeys.length; i++) {
        var statKey = hikedKeys[i];

        database.ref('users/userID: ' + userId + '/hiked/' + statKey).once('value').then(function(snapshot) {

            var statName = snapshot.val().hikedName;
            var statLon = snapshot.val().hikedLon;
            var statLat = snapshot.val().hikedLat;
            var statDistance = snapshot.val().hikedDistance;
            var statClimb = snapshot.val().hikedClimb;
            var statDifficulty = snapshot.val().hikedDifficulty;

            lifetimeDistance = lifetimeDistance + statDistance;
            lifetimeClimbed = lifetimeClimbed + statClimb;
            if (statDifficulty === "assets/images/green.svg") {
                lifetimeGreen++
            };
            if (statDifficulty === "assets/images/greenBlue.svg") {
                lifetimeGreenBlue++
            };
            if (statDifficulty === "assets/images/blue.svg") {
                lifetimeBlue++
            };
            if (statDifficulty === "assets/images/blueBlack.svg") {
                lifetimeBlueBlack++
            };
            if (statDifficulty === "assets/images/black.svg") {
                lifetimeBlack++
            };
            if (statDifficulty === "assets/images/dblack.svg") {
                lifetimeDBlack++
            };

            var statCard = {
                statName: statName,
                statLat: statLat,
                statLon: statLon
            };
            statDeck.push(statCard);
            appendStats();

        });
    }

}
appendStats();

function appendStats() {
    var distanceStat = $("<div id='distanceStat'><strong>Lifetime Distance</strong></div>");
    var a = $("<div id='distanceNumber'>" + lifetimeDistance.toFixed(2) + ".mi</div>");
    distanceStat.prepend(a);
    $("#lifetime-distance").html(distanceStat);

    var climbedStat = $("<div id='climbedStat'><strong>Lifetime Climbed</strong></div>");
    var b = $("<div id='climbedNumber'>" + lifetimeClimbed + ".ft</div>");
    climbedStat.prepend(b);
    $("#lifetime-climbed").html(climbedStat);

    drawChart();
    drawMarkersMap();
}

function drawChart() {
    google.charts.load("current", { packages: ['corechart'] });
    var data = google.visualization.arrayToDataTable([
        ["Difficulty", "Times Hiked", { role: "style" }],
        ["Green", lifetimeGreen, "#FF6A36"],
        ["Green-Blue", lifetimeGreenBlue, "#FFAB40"],
        ["Blue", lifetimeBlue, "#949494"],
        ["Blue Black", lifetimeBlueBlack, "color: #BD3C00"],
        ["Black", lifetimeBlack, "#FF6A36"],
        ["Double Black", lifetimeDBlack, "#FFAB40"]
    ]);

    var view = new google.visualization.DataView(data);
    view.setColumns([0, 1,
        {
            calc: "stringify",
            sourceColumn: 1,
            type: "string",
            role: "annotation"
        },
        2
    ]);

    var options = {
        title: "Trail Difficulties Hiked",
        width: 500,
        height: 300,
        bar: { groupWidth: "95%" },
        legend: { position: "none" },
        backgroundColor: { fill: 'transparent' },
    };
    var chart = new google.visualization.ColumnChart(document.getElementById("difficulty-chart"));
    chart.draw(data, options);
}
var mapArray
function drawMarkersMap() {
    mapArray = [];
    var headerArray = ['Lat', 'Long', 'Name'];
    mapArray.push(headerArray)
    for (var i = 0; i < statDeck.length; i++) {
        var locationArray = [];
        var statName = statDeck[i].statName;
        var statLat = statDeck[i].statLat;
        var statLon = statDeck[i].statLon;
        locationArray.push(statLat);
        locationArray.push(statLon);
        locationArray.push(statName);
        mapArray.push(locationArray)
    }

    var data = google.visualization.arrayToDataTable(mapArray);

    var options = {
        region: 'US',
        displayMode: 'markers',
        dataMode: 'markers',
        resolution: 'provinces',
        colorAxis: { colors: ['#aeea00', '#aeea00'] },
        backgroundColor: { fill: 'transparent' },
        datalessRegionColor: '#F8C482'
    };

    var chart = new google.visualization.GeoChart(document.getElementById("hiked-map"));
    chart.draw(data, options);
};




//TODO: Add leveling system

//TODO: Fix styling

//TODO: Add times hiked button


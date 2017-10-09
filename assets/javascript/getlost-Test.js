  var config = {
    apiKey: "AIzaSyAvugjmitwa9YtybYXRLIMob0PLtWn4gOE",
    authDomain: "getlost2-3c52f.firebaseapp.com",
    databaseURL: "https://getlost2-3c52f.firebaseio.com",
    projectId: "getlost2-3c52f",
    storageBucket: "getlost2-3c52f.appspot.com",
    messagingSenderId: "349180172151"
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

  /*profileImage.on("change", function() {
      console.log($(this))
      var profilePicPath = $(this)[0].files[0];

      console.log(profilePicPath)


  })*/

  btnSignUpEntry.on("click", e => {
      var email = txtEmail.val();
      var password = txtPassword.val();
      var displayName = txtDisplay.val().trim();
      var name = txtName.val();
      var location = txtLocation.val();


      auth = firebase.auth();


      var promise = auth.createUserWithEmailAndPassword(email, password).then(function(user) {

          database.ref('users/userID: ' + user.uid).set({
              displayName: displayName,
              name: name,
              location: location,
              profilePic: profilePic

          })



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
      $("#myModal").modal("hide")
      if (firebaseUser) {
          console.log("logged-in");
          loggedIn = true

          userId = firebase.auth().currentUser.uid
          console.log(userId)

          return database.ref('users/userID: ' + userId).once('value').then(function(snapshot) {
              console.log(snapshot.val())
              // username = snapshot.val() && snapshot.val().displayName;
              // userLocation = snapshot.val().location;

          }).then(function() {
              userSearch = userLocation
              geoTrailWeatherAPI();
              userProfile();
          })
          modalOpen.addClass("hide");
          btnLogOut.removeClass("hide");
          $("#results").addClass("hide");
          $("#nearYou").removeClass("hide");
          $("#second-page").removeClass("hide");


      } else {
          console.log("not logged in");
          loggedIn = false;
          btnLogOut.addClass("hide");
          modalOpen.removeClass("hide");
          $("#nearYou").addClass("hide");
          $("#second-page").addClass("hide");

      }
  });
  var test1;
  $("#test").on("click", function test() {
  return database.ref('/users/userID: ' + userId).once('value').then(function(snapshot) {
              console.log(snapshot.val())
              // username = snapshot.val() && snapshot.val().displayName;
              // userLocation = snapshot.val().location;

          })

  })


  // Search event
  var userSearch;
  var userDistance = 100;
  
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
                  //TODO make variables for condition, location,
                  var lat = response.trails[i].latitude;
                  var lon = response.trails[i].longitude;
                  var imgSmall = response.trails[i].imgSqSmall;
                  var trailWeb = response.trails[i].url;
                  var trailName = response.trails[i].name;
                  var trailSummary = response.trails[i].summary;
                  var trailLength = response.trails[i].length;
                  var trailAscent = response.trails[i].ascent;
                  var trailRating = response.trails[i].stars;
                  var trailDifficulty = response.trails[i].difficulty;
                  var trailLocation = response.trails[i].location;
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
                  console.log(trailLocation)
                  var currentTemp;
                  var weatherIcon;

                  var card = $("<div class='col-lg-2' id='card'>");
                  var a = $("<img id='thumbnail' src='" + imgSmall + "' alt='Please Upload a Photo" + trailWeb + "' height='150px' width='150px' border-radius='30px'>")
                  var b = $("<div class='caption'>")
                  var c = $("<h3>" + trailName + "</h3>")
                  var c2 = $("<h5>" + trailLocation + "</h5>")
                  var d = $("<p>" + trailSummary + "</p>")
                  var e = $("<p class='trailInfo'>Length: " + trailLength + " miles</p>")
                  var f = $("<p class='trailInfo'>Ascent: " + trailAscent + " ft.</p>")
                  var g = $("<p class='trailInfo'>Rating: " + trailRating + "/5</p>")
                  var h = $("<p class='trailInfo'>Difficulty: <img src='" + trailDifficulty + "'width='20px' height='20px'></p>")
                  var x = $("<p class='trailInfo' id='currentTemp" + [i] + "'>Current Temp: </p>")
                  var y = $("<p class='trailInfo' id='weatherIcon" + [i] + "'>Current Weather: </p>")
                  var z = $("<p><a href='#' id='favorite' role='button'><i class='fa fa-star-o' aria-hidden='true'></i></a></p>")
                  card.append(a);
                  card.append(b);
                  card.append(c);
                  card.append(c2);
                  card.append(d);
                  card.append(e);
                  card.append(f);
                  card.append(g);
                  card.append(h);
                  card.append(x);
                  card.append(y);
                  card.append(z);
                  //card.append(f);

                  $("#search-display").append(card)


                  weather(lat, lon, i);
              }
              // //WeatherUnderground Radar API AJAX
              // var radarURL = "http://api.wunderground.com/api/5bb60ec58c2a2733/radar/image.gif?centerlat=38&centerlon=-96.4&radius=100&width=280&height=280&newmaps=1"
              // $.ajax({
              //     url: radarURL,
              //     method: "GET"
              // }).done(function(response) {
              //     console.log(response)
              //     //$("#weather").append(response)

              // })

          });
      });
  }


  function weather(lat, lon, i) {
      var weatherURL = "http://api.wunderground.com/api/5bb60ec58c2a2733/conditions/geolookup/q/" + lat + "," + lon + ".json"

      $.ajax({
          url: weatherURL,
          method: "GET"
      }).done(function(response) {

          console.log(response)
          currentTemp = response.current_observation.temp_f;
          weatherIcon = response.current_observation.icon_url;
          $("#currentTemp" + [i]).append(currentTemp);
          $("#weatherIcon" + [i]).append("<img src ='" + weatherIcon + "'>");

      });
  }


  // Search Sent to APIs
  $("#btnSearch").on("click", function search() {
      $("#search-display").html("");
      userSearch = $("#userSearch").val();
      userDistance = $("#userDistance").val();
      $("#nearYou").addClass("hide");
      $("#results").removeClass("hide");
      geoTrailWeatherAPI();

  });

  function userProfile() {
      $("#profile-box").removeClass("hide")
      $("#username").html("<h3>" + username + "</h3>")
  };

  //TODO: Save favorites to profile, populate page with favorites, save data to profile show data on page, add social media
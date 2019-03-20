$(document).ready(() => {

  const config = {
    apiKey: "AIzaSyCOfAAL_Al46MrmoItev-O5gMjj1uhbzNs",
    authDomain: "fir-auth-test-40008.firebaseapp.com",
    databaseURL: "https://fir-auth-test-40008.firebaseio.com",
    projectId: "fir-auth-test-40008",
    storageBucket: "fir-auth-test-40008.appspot.com",
    messagingSenderId: "84698175282"
  };

  firebase.initializeApp(config);

  initApp();

  const toggleSignIn = () => {
    if (!firebase.auth().currentUser) {
      const provider = new firebase.auth.GoogleAuthProvider();
      provider.addScope("https://www.googleapis.com/auth/plus.login");
      firebase.auth().signInWithRedirect(provider);
    } else {
      firebase.auth().signOut();
      localStorage.clear()
    }
  }

  function initApp() {
    // Result from Redirect auth flow.
    // [START getidptoken]
    firebase
      .auth()
      .getRedirectResult()
      .then((result) => {
        if (result.credential) {
          // This gives you a Google Access Token. You can use it to access the Google API.
          const token = result.credential.accessToken;
          // [START_EXCLUDE]
          $("#oauthtoken").text(token);
        } else {
          $("#oauthtoken").text("null");
          // [END_EXCLUDE]
        }
        // The signed-in user info.
        const user = result.user;
      })
      .catch((error) => {
        // Handle Errors here.
        const errorCode = error.code;
        const errorMessage = error.message;
        // The email of the user's account used.
        const email = error.email;
        // The firebase.auth.AuthCredential type that was used.
        const credential = error.credential;
        // [START_EXCLUDE]
        if (errorCode === "auth/account-exists-with-different-credential") {
          alert(
            "You have already signed up with a different auth provider for that email."
          );
        } else {
          console.error(error);
        }
        // [END_EXCLUDE]
      });
    firebase.auth().onAuthStateChanged((user) => {
      if (user) {
        // User is signed in.
        const displayName = user.displayName;
        const email = user.email;
        const emailVerified = user.emailVerified;
        const photoURL = user.photoURL;
        const isAnonymous = user.isAnonymous;
        const uid = user.uid;
        const providerData = user.providerData;
        // [START_EXCLUDE]
        localStorage.setItem("email", email)
        localStorage.setItem("uid", uid)
        localStorage.setItem("avatar", photoURL)
        $("#sign-in-status").text("Signed in");
        $(".log-in").text("Sign out");
        $("#account-details").text(JSON.stringify(user, null, "  "));
        $("#user").text(`Welcome,`);
        $("#email").text(email);
        $("#send").prop("disabled", false);
        // $(".start").append(
        //   `<img src="https://user-images.githubusercontent.com/42519030/54242956-f424a380-44fc-11e9-89e3-76ece045f9ca.jpg"></img>`
        // );
        checkForMessages()
        // [END_EXCLUDE]
      } else {
        // User is signed out.
        // [START_EXCLUDE]
        $("#sign-in-status").text("Signed out");
        $(".log-in").text("Sign in with Google");
        $("#account-details").text("null");
        $("#oauthtoken").text("null");
        $("#user").html(`Goodbye`);
        $(".start, .welcome, #messages").empty();
        $("#send").prop("disabled", true);
      }
    });
  }

  $(document).on("click", ".log-in", event => {
    event.preventDefault()
    toggleSignIn();
  });

  $(document).on("click", "#send", event => {
    event.preventDefault()
    let username = localStorage.getItem("email")
    let uid = localStorage.getItem("uid")
    let avatar = localStorage.getItem("avatar")
    let message = $("#message").val().trim()
    let timestamp = moment().format('lll')
    let messageObj = {
      user: username,
      uid: uid,
      timestamp: timestamp,
      message: message
    }
    if (message !== "") {
      firebase.database().ref("chat").push(messageObj)
    }
    $("#message").val("")
  });

  const checkForMessages = () => {
    firebase.database().ref("chat").on("child_added", childSnapshot => {
      let username = childSnapshot.val().user
      let message = childSnapshot.val().message
      let uid = childSnapshot.val().uid
      let timestamp = childSnapshot.val().timestamp
      let localUid = localStorage.getItem("uid")
      const genId = Math.random()
        .toString(36)
        .substr(2, 8);
      $("#messages").append(`<div class="${uid} wrapper d-flex mb-2"><small class="time mx-2">${timestamp}</small><div class="badge badge-pill sent-msg ${genId}">${username}: ${message}</div></div>`)
      let id = `.${uid}`
      let badgeId = `.${genId}`
      if (uid === localUid) {
        // $(id).css("color", "blue")
        $(id).addClass("flex-row")
        $(badgeId).addClass("badge-primary")
      } else {
        $(id).addClass("flex-row-reverse badge-light")
        $(badgeId).addClass("badge-light")

        // $(id).css("color", "darkgrey")
      }
    })
  }

});
$(document).ready(function () {

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

  function toggleSignIn() {
    if (!firebase.auth().currentUser) {
      const provider = new firebase.auth.GoogleAuthProvider();
      provider.addScope("https://www.googleapis.com/auth/plus.login");
      firebase.auth().signInWithRedirect(provider);
    } else {
      firebase.auth().signOut();
    }
  }

  function initApp() {
    // Result from Redirect auth flow.
    // [START getidptoken]
    firebase
      .auth()
      .getRedirectResult()
      .then(function (result) {
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
      .catch(function (error) {
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
    firebase.auth().onAuthStateChanged(function (user) {
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
        $(".start, .welcome").empty();
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
    let message = $("#message").val().trim()
    let messageObj = {
      user: username,
      message: message
    }
    if (message !== "") {
      firebase.database().ref("chat").push(messageObj)
    }
    $("#message").val("")
  });

  const checkForMessages = () => {
    firebase.database().ref("chat").on("child_added", (childSnapshot) => {
      let username = childSnapshot.val().user
      let message = childSnapshot.val().message
      $("#messages").append(`<div id=${username}>${username}: ${message}</div>`)
    })
  }

});
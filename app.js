$(document).ready(function () {
  //Copy config object from firebase
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


  // let database = firebase.database()
  /**
   * Function called when clicking the Login/Logout button.
   */
  // [START buttoncallback]
  function toggleSignIn() {
    if (!firebase.auth().currentUser) {
      // [START createprovider]
      const provider = new firebase.auth.GoogleAuthProvider();
      // [END createprovider]
      // [START addscopes]
      provider.addScope("https://www.googleapis.com/auth/plus.login");
      // [END addscopes]
      // [START signin]
      firebase.auth().signInWithRedirect(provider);
      // [END signin]
    } else {
      // [START signout]
      firebase.auth().signOut();
      // [END signout]
    }
  }
  // [END buttoncallback]
  /**
   * initApp handles setting up UI event listeners and registering Firebase auth listeners:
   *  - firebase.auth().onAuthStateChanged: This listener is called when the user is signed in or
   *    out, and that is where we update the UI.
   *  - firebase.auth().getRedirectResult(): This promise completes when the user gets back from
   *    the auth redirect flow. It is where you can get the OAuth access token from the IDP.
   */
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
          // If you are using multiple auth providers on your app you should handle linking
          // the user's accounts here.
        } else {
          console.error(error);
        }
        // [END_EXCLUDE]
      });
    // [END getidptoken]
    // Listening for auth state changes.
    // [START authstatelistener]
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
        // [END_EXCLUDE]
      }
    });
    // [END authstatelistener]
  }

  $(document).on("click", ".log-in", event => {
    toggleSignIn();
  });

  $(document).on("click", "#send", (event) => {
    let username = localStorage.getItem("email")
    let message = $("#message").val().trim()

    let messageObj = {
      user: username,
      message: message
    }
    firebase.database().ref("chat").push(messageObj)


  });

  const checkForMessages = () => {
    firebase.database().ref("chat").on("child_added", function (childSnapshot) {

      let username = childSnapshot.val().user
      let message = childSnapshot.val().message
      console.log(message)

      $("#messages").append(`<div id=${username}>${username}: ${message}</div>`)
    })
  }

});
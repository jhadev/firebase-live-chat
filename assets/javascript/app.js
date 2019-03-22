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
  };

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
        $(".log-in").text("Sign Out");
        $("#account-details").text(JSON.stringify(user, null, "  "));
        $("#user").text(`Welcome,`);
        $(".email").text(email);
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
        $(".log-in").text("Sign In With Google");
        $("#account-details").text("null");
        $("#oauthtoken").text("null");
        $("#user").html(`Goodbye`);
        $(".start, .welcome, #messages, .email").empty();
        $("#send").prop("disabled", true);
      }
    });
  };

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
    if (message !== "" && message.length <= 140) {
      firebase.database().ref("chat").push(messageObj)
      $("#message").val("")
      $(".alert").alert("close");
      $('#count-message').html(`${textMax} chars remaining`)
    } else {
      if (message.length > 140) {
        handleErrors()
        $(".alert").text(`You typed ${message.length} characters. The maximum is 140`);
        $('#count-message').html(`${textMax} chars remaining`)
      }
      if (message === "") {
        handleErrors()
        $(".alert").text(`Please enter a valid value.`)
        $('#count-message').html(`${textMax} chars remaining`);
      }
    };
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
      $("#messages").append(`
      <div class="${uid} wrapper flex-column d-flex mb-3">
        <small class="time">${timestamp}</small>  
        <small class="user-name mb-1">${username}</small>
        <div class="badge sent-msg ${genId}">${message.linkify()}</div>
      </div>`)
      let id = `.${uid}`
      let badgeId = `.${genId}`
      $('html, body').animate({
        scrollTop: $(document).height()
      }, 'fast');
      if (uid === localUid) {
        $(id).addClass("align-items-end")
        $(badgeId).addClass("badge-primary")
      } else {
        $(id).addClass("align-items-start")
        $(badgeId).addClass("badge-secondary")
      }
    });
  };

  const handleErrors = () => {
    $("#message").val("");
    const alertDiv = $("<div>");
    alertDiv
      .addClass("mt-4 alert alert-danger")
      .attr("role", "alert")
      .attr("data-dismiss", "alert")
    $(".form-group").append(alertDiv);
  };

  $(".alert").on("click", event => {
    $(".alert").alert("close");
  });

  $(document).on("click", ".log-in", event => {
    event.preventDefault()
    toggleSignIn();
  });

  let textMax = 140;
  $('#count-message').html(`${textMax} chars remaining`);

  $('#message').keyup(function () {
    let textLength = $('#message').val().length;
    let textRemaining = textMax - textLength;

    $('#count-message').html(`${textRemaining} chars remaining`);
  });

  //detect links and images in message strings
  if (!String.linkify) {
    String.prototype.linkify = function () {
      let urlPattern = /\b(?:https?|ftp):\/\/[a-z0-9-+&@#\/%?=~_|!:,.;]*[a-z0-9-+&@#\/%=~_|]/gim;
      let pseudoUrlPattern = /(^|[^\/])(www\.[\S]+(\b|$))/gim;
      let emailAddressPattern = /[\w.]+@[a-zA-Z_-]+?(?:\.[a-zA-Z]{2,6})+/gim;
      let imgUrlPattern = /(https?:\/\/.*\.(?:png|jpg|gif|jpeg))/i

      let img = this.replace(imgUrlPattern, `$1<a class="msg-link" href="$2" target="_blank"><img class="msg-img img-fluid" src="$&"></a>`)
      return this
        .replace(urlPattern, `<a class="msg-link" href="$&" target="_blank">$&</a>`)
        .replace(pseudoUrlPattern, '$1<a class="msg-link" href="http://$2" target="_blank">$2</a>')
        .replace(emailAddressPattern, '<a href="mailto:$&">$&</a>')
        .replace(imgUrlPattern, img)

      // let img = this.replace(urlPattern, `$1<a class="msg-link" href="$&" target="_blank"><img class="msg-img img-fluid rounded" src="$&"></a>`)
      // return this
      //   .replace(urlPattern, `<a class="msg-link" href="$&" target="_blank">$&</a>`)
      //   .replace(pseudoUrlPattern, '$1<a class="msg-link" href="http://$2" target="_blank">$2</a>')
      //   .replace(emailAddressPattern, '<a href="mailto:$&">$&</a>')
      //   .replace(imgUrlPattern, img)
    };
  }
});
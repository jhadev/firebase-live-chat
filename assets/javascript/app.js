$(document).ready(function () {

  $(function () {
    $('[data-toggle="tooltip"]').tooltip()
  })

  // declare notification sounds
  const alert = new Audio("assets/sounds/alert.mp3")
  const sent = new Audio("assets/sounds/sent.mp3")

  // cloudinary config
  const widget = cloudinary.createUploadWidget({
    cloudName: "dvyx7biyp",
    uploadPreset: "kkgec3pb",
    sources: [
      "local",
      "url",
      "camera"
    ],
    defaultSource: "local",
    styles: {
      palette: {
        window: "#F5F5F5",
        sourceBg: "#FFFFFF",
        windowBorder: "#90a0b3",
        tabIcon: "#007BFF",
        inactiveTabIcon: "#69778A",
        menuIcons: "#007BFF",
        link: "#FA7203",
        action: "#8F5DA5",
        inProgress: "#007BFF",
        complete: "#FA7203",
        error: "#c43737",
        textDark: "#000000",
        textLight: "#FFFFFF"
      },
      fonts: {
        default: null,
        "'IBM Plex Sans', sans-serif": {
          url: "https://fonts.googleapis.com/css?family=IBM+Plex+Sans",
          active: true
        }
      }
    }
  }, (error, result) => {
    if (!error && result && result.event === "success") {
      $("#message").val(result.info.secure_url);
    }
  });
  // firebase config
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

  // Google OAuth with redirect
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
        localStorage.setItem("name", displayName)
        localStorage.setItem("email", email)
        localStorage.setItem("uid", uid)
        localStorage.setItem("avatar", photoURL)
        $("#sign-in-status").text("Signed in");
        $(".log-in").text("Sign Out");
        $("#account-details").text(JSON.stringify(user, null, "  "));
        $("#user").text(`Welcome,`);
        $(".welcome-msg").empty()
        $(".email").text(email);
        $("#send, #upload").prop("disabled", false);
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
        $(".welcome-msg").text("Sign in with your Google account.")
        $(".start, #user, #messages, .email").empty();
        $("#send, #upload").prop("disabled", true);
      }
    });
  };

  // poll firebase when new message is added and write to page
  const checkForMessages = () => {
    firebase.database().ref("chat").on("child_added", childSnapshot => {
      let username = childSnapshot.val().user
      let name = childSnapshot.val().name
      let message = childSnapshot.val().message
      let uid = childSnapshot.val().uid
      let timestamp = childSnapshot.val().timestamp
      let avatar = childSnapshot.val().avatar
      let localUid = localStorage.getItem("uid")
      const genRandomString = Math.random()
        .toString(36)
        .substr(2, 8);
      $("#messages").append(`
      <div class="${uid} wrapper flex-column d-flex mb-3">
        <small class="time">${timestamp}</small>
        <small class="user-name mb-1" data-toggle="tooltip" data-placement="top" title="${username}">
          <img src="${avatar}" class="avatar rounded text-right mx-1">
            ${name}
        </small>
        <div class="badge sent-msg ${genRandomString}">${message.linkify()}</div>
      </div>`)
      let uidClass = `.${uid}`
      let badgeClass = `.${genRandomString}`
      if (uid === localUid) {
        $(uidClass).addClass("align-items-end")
        $(badgeClass).addClass("badge-primary")
        $(".user-name").attr("data-placement", "left");
      } else {
        // alert.play()
        $(uidClass).addClass("align-items-start")
        $(badgeClass).addClass("badge-secondary")
        $(".user-name").attr("data-placement", "right");
      }
    });
  };

  // char counter
  let textMax = 300;
  $('#count-message').html(`${textMax} chars remaining`);

  $('#message').on("keyup input", function () {
    let textLength = $('#message').val().length;
    let textRemaining = textMax - textLength;

    $('#count-message').html(`${textRemaining} chars remaining`);
  });

  // click functions
  $(".alert").on("click", event => {
    $(".alert").alert("close");
  });

  $(document).on("click", "#send", event => {
    event.preventDefault()
    packageMessage(textMax, handleErrors);
  });

  $(document).on("click", ".log-in", event => {
    event.preventDefault()
    toggleSignIn();
  });

  $(document).on("click", ".input", event => {
    event.preventDefault()
    if ($(".footer").hasClass("sticky-footer")) {
      $(".footer").removeClass("sticky-footer")
      $(".input").text("Show Input")
    } else {
      $(".footer").addClass("sticky-footer")
      $(".input").text("Hide Input")
    }
  })

  $(document).on("click", ".theme", event => {
    event.preventDefault();
    checkTheme();
  });

  $(document).on("click", ".email", event => {
    $(".modal").modal()
  });

  $(document).on("click", "#upload", event => {
    event.preventDefault()
    widget.open()
  });

  $(document).on("click", ".user-name", event => {
    event.preventDefault()
    $(".user-name").tooltip()
  });

  //input message functions
  const handleErrors = () => {
    // $("#message").val("");
    const alertDiv = $("<div>");
    alertDiv
      .addClass("alert alert-danger")
      .attr("role", "alert")
      .attr("data-dismiss", "alert")
    $(".input-group").after(alertDiv);
  };

  const packageMessage = (textMax, handleErrors) => {
    let username = localStorage.getItem("email");
    let uid = localStorage.getItem("uid");
    let avatar = localStorage.getItem("avatar");
    let name = localStorage.getItem("name")
    let message = $("#message").val().trim();
    let timestamp = moment().format('lll');
    let messageObj = {
      user: username,
      name: name,
      uid: uid,
      timestamp: timestamp,
      message: message,
      avatar: avatar
    };
    if (message !== "" && message.length <= textMax) {
      firebase.database().ref("chat").push(messageObj);
      $("#message").val("");
      $(".alert").alert("close");
      $('#count-message').html(`${textMax} chars remaining`);
      $('html, body').animate({
        scrollTop: $(document).height()
      }, 'fast');
      sent.play()
    } else {
      if (message.length > textMax) {
        handleErrors();
        $(".alert").text(`You typed ${message.length} characters. The maximum is ${textMax} characters. If we wanted to read a novel, we'd get a book.`);
        $('#count-message').html(`${textMax} chars remaining.`);
      }
      if (message === "") {
        handleErrors();
        $(".alert").text(`The sound of silence cannot be heard here.`);
        $('#count-message').html(`${textMax} chars remaining`);
      }
    };
  }

  const checkTheme = () => {
    if ($("body").hasClass("bg-light")) {
      $("body, .footer").removeClass("bg-light");
      $(".navbar, .wrapper, .label, #count-message").removeClass("text-dark");
      $(".navbar").removeClass(`bg-light navbar-light`);
      $(".theme, .github").removeClass("badge-dark text-light");

      //
      $("body, .footer").addClass("bg-dark");
      $(".navbar, .wrapper, .label, #count-message").addClass("text-light");
      $(".navbar").addClass(`navbar-dark bg-dark`);
      $(".theme").text("Light");
      $(".theme, .github").addClass("badge-light text-dark");

      //
    } else if ($("body").hasClass("bg-dark")) {
      $("body, .footer").removeClass("bg-dark");
      $(".navbar, .wrapper, .label, #count-message").removeClass("text-light");
      $(".navbar").removeClass(`bg-dark navbar-dark`);
      $(".theme, .github").removeClass("badge-light text-dark");

      //
      $("body, .footer").addClass("bg-light");
      $(".navbar, .wrapper, .label, #count-message").addClass("text-dark");
      $(".navbar").addClass(`bg-light navbar-light`);
      $(".github").addClass("badge-dark text-light");
      $(".theme")
        .text("Dark")
        .addClass("badge-dark");
    }
  };

  //detect links, images, video in message strings and render tags accordingly.
  if (!String.linkify) {
    String.prototype.linkify = function () {
      let urlPattern = /(?!.*(?:\.jpe?g|\/iframe>|\.gif|\.png|\.mp4|\.mp3)$)\b(?:https?|ftp):\/\/[a-z0-9-+&@#\/%?=~_|!:,.;]*[a-z0-9-+&@#\/%=~_|]/gim;
      let pseudoUrlPattern = /(^|[^\/])(www\.[\S]+(\b|$))/gim;
      let emailAddressPattern = /[\w.]+@[a-zA-Z_-]+?(?:\.[a-zA-Z]{2,6})+/gim;
      let imgUrlPattern = /(?=.*(?:\.jpe?g|\.gif|\.png)$)\b(?:https?|ftp):\/\/[a-z0-9-+&@#\/%?=~_|!:,.;]*[a-z0-9-+&@#\/%=~_|]/gim;
      let videoUrlPattern = /(?=.*(?:\.mp4|\.ogg)$)\b(?:https?|ftp):\/\/[a-z0-9-+&@#\/%?=~_|!:,.;]*[a-z0-9-+&@#\/%=~_|]/gim
      let audioUrlPattern = /(?=.*(?:\.mp3)$)\b(?:https?|ftp):\/\/[a-z0-9-+&@#\/%?=~_|!:,.;]*[a-z0-9-+&@#\/%=~_|]/gim

      return this
        .replace(urlPattern, `<a class="msg-link" href="$&" target="_blank">$&</a>`)
        .replace(pseudoUrlPattern, '$1<a class="msg-link" href="http://$2" target="_blank">$2</a>')
        .replace(emailAddressPattern, '<a href="mailto:$&">$&</a>')
        .replace(imgUrlPattern, `
        <a class="msg-link" href="$&" target="_blank">
          <img class="msg-img img-fluid rounded img-thumbnail" src="$&">
        </a>`)
        .replace(videoUrlPattern, `
        <video class="msg-video img-thumbnail" controls>
          <source src="$&" type="video/mp4">
        </video>`)
        .replace(audioUrlPattern, `
        <audio controls>
          <source src="$&" type="audio/mpeg">
        </audio>`)
    };
  }
});
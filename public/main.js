var userId = null;

const InitFireBase = () => {
  // Your web app's Firebase configuration
  var firebaseConfig = {
    apiKey: "AIzaSyDjWIFqai6XVHVNWYZJpbHvwezTgy2hfJE",
    authDomain: "secret-santa-bg.firebaseapp.com",
    databaseURL: "https://secret-santa-bg.firebaseio.com",
    projectId: "secret-santa-bg",
    storageBucket: "secret-santa-bg.appspot.com",
    messagingSenderId: "291078235364",
    appId: "1:291078235364:web:e6777d9908fdb3387db8f1"
  };
  firebase.initializeApp(firebaseConfig);
};


const objectifyForm = (formArray) => {
  //serialize data function
  var returnArray = {};
  for (var i = 0; i < formArray.length; i++){
    returnArray[formArray[i]['name']] = formArray[i]['value'];
  }
  return returnArray;
}


const LoadMatchFireBase = async (matchId) => {
  if (matchId) {
    const snapshot = await firebase.database().ref('preferences/' + matchId).once('value');
    if (snapshot.val()) {
      const target = snapshot.val();
      var template = $("#match").html();
      var text = Mustache.render(template, target);
      $("#content").html(text);
      return;
    }
  }
  $(".db-auth").toggleClass("d-none");
}

const LoadFromFireBase = async (name) => {
  try {
    const snapshot = await firebase.database().ref('preferences/' + userId).once('value');
    if (snapshot.val()) {
      const target = snapshot.val();
      console.log("LoadFromFireBase: ");
      console.log(target);
      for (const [key, value] of Object.entries(target)) {
        $("#profile").find(`[name=${key}]`).val(value);
      }
      LoadMatchFireBase(target.match);
    } else {
      await firebase.database().ref('preferences/' + userId).set({'name': name});
      $("#profile").find(`[name=name]`).val(name);
    }
  } catch(e) {
    console.error("LoadFromFireBase: " + e);
  }
};

const SaveOnFireBase = async () => {
    const data = objectifyForm($("form").serializeArray());
    console.log(data);
    try {
      await firebase.database().ref('preferences/' + userId).set(data);
      $('#profileForm').modal('toggle')
    } catch(e) {
      console.log(e);
      alert("Sorry something broke! Call me to get it fixed!")
    }
};

const checkLoginState = (showError) => {
  FB.getLoginStatus(async (response) => {
    console.log(response);
    if (response.status == "connected") {
      $("#profileButton").removeClass("d-none");
      userId = response.authResponse.userID;
      FB.api('/me', {fields: 'name'}, function(response) {
        var template = $("#pending-match").html();
        var text = Mustache.render(template, response);
        $("#content").html(text);
        LoadFromFireBase(response.name);
      });
    } else if (showError === true) {
      $("#content").append("Something went wrong. Are you logged into fb?");
    }
  });
}

$( document ).ready(async () => {
  InitFireBase();
  $( "form" ).submit( event => {
    event.preventDefault();
  });
});

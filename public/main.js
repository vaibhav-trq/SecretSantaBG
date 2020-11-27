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

const LoadFromFireBase = async (name) => {
  try {
    const snapshot = await firebase.database().ref('preferences/' + userId).once('value');
    if (snapshot.val()) {
      const target = snapshot.val();
      if (target.match) {
        var template = $("#match").html();
        var text = Mustache.render(template, target);      
        $("#content").html(text);  
      } else {
        $(".db-auth").toggleClass("d-none");
      }
    } else {
      await firebase.database().ref('preferences/' + userId).set({'name': name});
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
    } catch(e) {
      console.log(e);
    }
};

const checkLoginState = () => {
  FB.getLoginStatus(async (response) => {
    console.log(response);
    if (response.status == "connected") {
      userId = response.authResponse.userID;
      FB.api('/me', {fields: 'name'}, function(response) {
        var template = $("#pending-match").html();
        var text = Mustache.render(template, response); 
        $("#content").html(text);
        LoadFromFireBase(response.name);
      });
    } else {
      $("#content").html("Something went wrong. Are you logged into fb?");
    }
  });
}

$( document ).ready(async () => {
  InitFireBase();
  $( "form" ).submit( event => {
    event.preventDefault();
  });
});

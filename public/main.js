var userId = null;
var accessToken = null;
var yourSantaId = null;
var gifteeId = null;
var gifteeName = null;

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
      gifteeId = matchId;
      gifteeName = target['name'];
      chatListener(`${userId}-${gifteeId}`, 'gifteeChat');
      chatListener(`${yourSantaId}-${userId}`, 'santaChat');
      $('#chatButton').removeClass("d-none");
    }
  }
  $(".db-auth").toggleClass("d-none");
};

const LoadFromFireBase = async (name) => {
  try {
    console.log("LoadFromFireBase: Starting...");
    const snapshot = await firebase.database().ref('preferences/' + userId).once('value');
    if (snapshot.val()) {
      const target = snapshot.val();
      console.log("LoadFromFireBase: ");
      console.log(target);
      for (const [key, value] of Object.entries(target)) {
        $("#profile").find(`[name=${key}]`).val(value);
      }
      yourSantaId = target['my_santa'];
      await LoadMatchFireBase(target.match);
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
      await firebase.database().ref('preferences/' + userId).update(data);
      $('#profileForm').modal('toggle')
    } catch(e) {
      console.log(e);
      alert("Sorry something broke! Call me to get it fixed!")
    }
};

const checkLoginState = (showError) => {
  FB.getLoginStatus(async (r) => {
    console.log(r);
    if (r.status == "connected") {
      $("#profileButton").removeClass("d-none");
      userId = r.authResponse.userID;
      accessToken = r.authResponse.accessToken;
      FB.api('/me', {fields: 'name'}, async (response) => {
        var template = $("#pending-match").html();
        var text = Mustache.render(template, response);
        $("#content").html(text);
        await LoadFromFireBase(response.name);
      });
    } else if (showError === true) {
      $("#content").append("Something went wrong. Are you logged into fb?");
    }
  });
};

const updateChatScroll = () => {
  var element = document.getElementById("chat");
  element.scrollTop = element.scrollHeight;
}

const chatListener = async (chatId, chatDiv) => {
  firebase.database().ref(`chats/${chatId}`).on('child_added', value => {
    let data = value.val();
    if (data.sender == userId) {
      data.messageFrom = 'me';
    } else if (data.sender == 'system') { 
      data.messageFrom = 'system';
    } else {
      data.messageFrom = 'him';
    }
    var template = $("#chatMessage").html();
    var text = Mustache.render(template, data);
    $(`#${chatDiv}`).find('ul').prepend(text);
  });
};

const sendMessage = async (chatId, chatbox) => {
  const chatInput = $(`#${chatbox}`).find(`[name=sendMessage]`);
  const message = chatInput.val();
  if (message) {
    const chatRef = firebase.database().ref('chats/' + chatId);
    await chatRef.push({'message': message, 'time': Date.now(), 'sender': userId});
    chatInput.val('');
  }
}

function notifyUser(userId) {
  FB.api(`/${userId}/notifications`, 'POST', {accessToken, template: "Your santa messaged you!", href:'index.html'}, async (response) => {
    console.log(response);
  });
};

const sendMessageToGiftee = () => {
  chatId = `${userId}-${gifteeId}`
  console.log(chatId);
  sendMessage(chatId, 'gifteeChatModal');
}

const sendMessageToSanta = () => {
  chatId = `${yourSantaId}-${userId}`
  sendMessage(chatId, 'santaChatModal');
}

$( document ).ready(async () => {
  InitFireBase();
  $( "form" ).submit( event => {
    event.preventDefault();
  });
});

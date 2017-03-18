var edgeCMS = (function() {
  var edgeCMS = {};

  function prepareFirebase() {
    var config = {
      apiKey: "AIzaSyBuWvVLmh4NGzfzsGBKIqmRsR9BtVJF1zE",
      authDomain: "edge-cms.firebaseapp.com",
      databaseURL: "https://edge-cms.firebaseio.com",
      storageBucket: "edge-cms.appspot.com",
      messagingSenderId: "1082973155115"
    };
    firebase.initializeApp(config);
  }

  function watchForUpdates() {
    var domain = document.domain.replace(/\./g, "~");
    if (domain != "") {
      var ref = firebase.database().ref().child(domain);
      var editableElements = document.getElementsByClassName("edge-cms");
      ref.once('value').then(function(snapshot) {
        snapshot.forEach(function(childSnapshot) {
          for (i=0; i < editableElements.length; i++) {
            if (editableElements[i].getAttribute("data-key-name") === childSnapshot.key) {
              editableElements[i].innerHTML = childSnapshot.val();
            }
          }
        });
      });
    } else {
      alert("Edge-CMS requires a valid domain name. Loading original HTML Values.");
    }
    document.body.style.opacity = 1;
  }

  // two functions for allowing/disallowing editing of edge-cms classes
  function makeNotEditable() {
    var editableElements = document.getElementsByClassName("edge-cms");
    for (i=0; i < editableElements.length; i++) {
      editableElements[i].setAttribute("contenteditable", "false");
    }
  }

  function makeEditable() {
    var editableElements = document.getElementsByClassName("edge-cms");
    for (i=0; i < editableElements.length; i++) {
      editableElements[i].setAttribute("contenteditable", "true");
    }
  }

  // add/remove save button
  function removeSaveButton() {
    var button = document.getElementById("fixed-pos-button");
    button.style.display = "none";
  }

  var saveButton;
  function addSaveButton() {
    if (saveButton != undefined) {
      saveButton.style.display = "fixed";
    }
    else {
      saveButton = document.createElement("button");
      saveButton.setAttribute("id", "fixed-pos-button");
      saveButton.innerHTML = "Save";
      saveButton.addEventListener("click", saveClicked);
      document.body.appendChild(saveButton);
    }
  }

  // add/remove edit button
  function removeEditButton() {
    var button = document.getElementById("fixed-pos-edit-button");
    button.style.display="none";
  }

  var editButton
  function addEditButton(){
    if (editButton != undefined){
      editButton.style.display="fixed";
    }
    else {
      editButton = document.createElement("button");
      editButton.setAttribute("id", "fixed-pos-edit-button");
      editButton.innerHTML = "Edit";
      editButton.addEventListener("click", editClicked);
      document.body.appendChild(editButton);
    }
  }

  // saving info to firebase when click 'save' button,
  // make uneditable, hide save button and display edit button
  function saveClicked() {
    var domain = document.domain.replace(/\./g, "~");
    var ref = firebase.database().ref().child(domain);
    var editableElements = document.getElementsByClassName("edge-cms");
    for (i=0; i < editableElements.length; i++) {
      var keyName = editableElements[i].getAttribute("data-key-name");
      var dict = {};
      dict[keyName] = editableElements[i].innerHTML;
      ref.update(dict);
    }
    makeNotEditable();
    removeSaveButton();
    addEditButton();
  }

  // makes edge-cms fields editable again and brings back the save button
  function editClicked() {
    makeEditable();
    removeEditButton();
    addSaveButton();
  }

  //login button
  var loginBtn;
  function addLoginButton() {
    if (loginBtn != undefined) {
      return;
    }
    loginBtn = document.createElement("button");
    loginBtn.id = "edgeCmsLoginBtn";
    loginBtn.innerHTML = "Log in";
    loginBtn.addEventListener("click", loginClicked);
    document.body.appendChild(loginBtn);
  }

  function loginClicked() {
    var loginModal = createLoginModal();
    document.body.appendChild(loginModal);
    loginModal.style.display = "block";
  }

  //logout button
  var logoutBtn;
  function addLogoutButton() {
    if (logoutBtn != undefined) {
      return;
    }
    logoutBtn = document.createElement("button");
    logoutBtn.id = "edgeCmsLogoutBtn";
    logoutBtn.innerHTML = "Log out";
    logoutBtn.addEventListener("click", logoutClicked);
    document.body.appendChild(logoutBtn);
  }

  function logoutClicked() {
    var logoutModal = createLogoutModal();
    document.body.appendChild(logoutModal);
    logoutModal.style.display = "block";
  }

  function watchAuthState() {
    firebase.auth().onAuthStateChanged(function(user) {
      console.log("Auth state changed");
      if (user) {
        console.log("User logged in");
        makeEditable();
        addSaveButton();
        document.getElementsByClassName("modal")[0].style.display = "none";
      } else {
        // No user is signed in.
        console.log("No user logged in");
        removeSaveButton();
        makeNotEditable();
      }
    });
  }

  function firebaseReady() {
    prepareFirebase();
    watchForUpdates();
    watchAuthState();
    addLoginButton();
    addLogoutButton();
  }

  var loginForm;
  function createLoginForm() {
    if (loginForm != undefined) {
      return loginForm
    }
    loginForm = document.createElement("form");
    var emailLabel = document.createElement("label");
    var emailInput = document.createElement("input");
    var passwordLabel = document.createElement("label");
    var passwordInput = document.createElement("input");
    var submitBtn = document.createElement("button");

    emailInput.setAttribute("type", "email");
    emailInput.setAttribute("name", "email");
    emailInput.setAttribute("class", "edge-input");
    passwordInput.setAttribute("type", "password");
    passwordInput.setAttribute("name", "password");
    passwordInput.setAttribute("class", "edge-input");
    submitBtn.setAttribute("type", "submit");
    emailLabel.setAttribute("for", "email");
    passwordLabel.setAttribute("for", "password");

    emailLabel.innerHTML = "Email Address:";
    passwordLabel.innerHTML = "Password:";
    submitBtn.innerHTML = "Submit";

    loginForm.appendChild(emailLabel);
    loginForm.appendChild(emailInput);
    loginForm.appendChild(passwordLabel);
    loginForm.appendChild(passwordInput);
    loginForm.appendChild(submitBtn);

    loginForm.onsubmit = function() {
      var email = emailInput.value;
      var password = passwordInput.value;
      console.log(email);
      console.log(password);
      firebase.auth().signInWithEmailAndPassword(email, password).catch(function(error) {
        var errorCode = error.code;
        var errorMessage = error.message;
        console.log(errorMessage);
      });

      return false;
    };

    return loginForm;
  }

  // creating the login modal
  var modalDiv;
  function createLoginModal() {
    if (modalDiv != undefined) {
      return modalDiv;
    }
    modalDiv = document.createElement("div");
    var contentDiv = document.createElement("div");
    var closeButton = document.createElement("span");
    var modalHeader = document.createElement("h3");
    var loginForm = createLoginForm();

    modalDiv.setAttribute("class", "modal");
    contentDiv.setAttribute("class", "modal-content");

    loginForm.style.marginTop = "20px";

    closeButton.innerHTML = "x";
    modalHeader.innerHTML = "Enter your login information";

    closeButton.addEventListener("click", function() {
      modalDiv.style.display = "none";
    });

    window.onclick = function(event) {
      if (event.target == modalDiv) {
        modalDiv.style.display = "none";
      }
    }

    contentDiv.appendChild(closeButton);
    contentDiv.appendChild(modalHeader);
    contentDiv.appendChild(loginForm);
    modalDiv.appendChild(contentDiv);

    return modalDiv;
  }

  // create logout modal, just to confirm logging out
  var modalDivClose;
  function createLogoutModal() {
    if (modalDivClose != undefined) {
      return modalDivClose;
    }
    modalDivClose = document.createElement("div");
    var contentDivClose = document.createElement("div");
    var closeButtonClose = document.createElement("span");
    var modalHeaderClose = document.createElement("h3");
    var confirmCloseBtn = document.createElement("button");

    modalDivClose.setAttribute("class", "modal");
    contentDivClose.setAttribute("class", "modal-content");

    closeButton.innerHTML = "x";
    modalHeaderClose.innerHTML = "Are you sure you want to log out?";
    confirmCloseBtn.addEventListener("click", function() {
      firebase.auth().signOut();
    });

    closeButton.addEventListener("click", function() {
      modalDivClose.style.display = "none";
    });

    window.onclick = function(event) {
      if (event.target == modalDivClose) {
        modalDivClose.style.display = "none";
      }
    }
  }

  //window.onload = function () {
  edgeCMS.begin= function () {
    $.getScript("https://www.gstatic.com/firebasejs/3.4.1/firebase.js")
      .done(firebaseReady)
      .fail(console.log.bind(console));
    /*
    firebaseReady();
    */
  }

  return edgeCMS;
}());

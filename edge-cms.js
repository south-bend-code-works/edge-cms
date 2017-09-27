var edgeCMS = (function() {
  var edgeCMS = {};
  edgeCMS.config = {
    firebase: {
      apiKey: "AIzaSyDwWt7XfOeWPIQmRg6Z-M21ErJixCEWRWg",
      authDomain: "edge-cms-sandbox.firebaseapp.com",
      databaseURL: "https://edge-cms-sandbox.firebaseio.com",
      projectId: "edge-cms-sandbox",
      storageBucket: "edge-cms-sandbox.appspot.com",
      messagingSenderId: "115715838641"
    },
    namespace: document.domain,
    version: '3.4.1'
  };

  function prepareFirebase() {
    edgeCMS.app = firebase.initializeApp(edgeCMS.config.firebase,'__edgeCMS');
  }

  function watchForUpdates() {
    if (edgeCMS.config.namespace != "") {
      var ref = edgeCMS.app.database().ref().child(edgeCMS.config.namespace);
      var editableElements = document.getElementsByClassName("edge-cms");

      ref.once('value').then(function(snapshot) {
        var edgeValues = snapshot.val();

        // for each editableElement
        for (i in editableElements){
          // look through firebase
          for (j in edgeValues){
            // for the corresponding entry
            if (editableElements[i].getAttribute("data-key-name") === j) {
              //fill display text with stored data-key-name
              editableElements[i].innerHTML = edgeValues[j].text;
              // assign link value to variable, even if there is no link
              // then check to see if it is undefined before assigning to html
              var link = edgeValues[j].link;
              if (link !== undefined){
                editableElements[i].setAttribute("href", link);
              }
            }
          }
        }
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
      saveButton.style.display = "block";
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
      editButton.style.display="block";
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
    var ref = edgeCMS.app.database().ref().child(edgeCMS.config.namespace);
    var editableElements = document.getElementsByClassName("edge-cms");
    for (i=0; i < editableElements.length; i++) {
      var keyName = editableElements[i].getAttribute("data-key-name");
      var dict = {};
      var thisElement = {};

      // check if the element has a link and record it if necessary
      if (typeof $(editableElements[i]).attr('href') !== "undefined"){
        thisElement = {
          text : editableElements[i].innerHTML,
          link : $(editableElements[i]).attr('href')
        };
      }
      else{
        thisElement = {
          text : editableElements[i].innerHTML
        };
      }
      dict[keyName] = thisElement;
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
    // signs out without any 'are you sure' message
    // this should only be temporary
    edgeCMS.app.auth().signOut();
    location.reload();
    // taking the confirmation window out for now
    // var logoutModal = createLogoutModal();
    // document.body.appendChild(logoutModal);
    // logoutModal.style.display = "block";
  }

  function watchAuthState() {
    edgeCMS.app.auth().onAuthStateChanged(function(user) {
      console.log("Auth state changed");
      if (user) {
        console.log("User logged in");
        addEditButton();
        // makeEditable();
        // addSaveButton();
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
    createLinkEditModal();
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
    submitBtn.setAttribute("id", "logInConfirmBtn")
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
      edgeCMS.app.auth().signInWithEmailAndPassword(email, password).catch(function(error) {
        var errorCode = error.code;
        var errorMessage = error.message;
        console.log(errorMessage);
      });

      return false;
      location.reload();

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
  //**************taking out for now
  // var modalDivClose;
  // function createLogoutModal() {
  //   if (modalDivClose != undefined) {
  //     return modalDivClose;
  //   }
  //   else{
  //     modalDivClose = document.createElement("div");
  //     var contentDivClose = document.createElement("div");
  //     var closeButtonClose = document.createElement("span");
  //     var modalHeaderClose = document.createElement("h3");
  //     var confirmCloseBtn = document.createElement("button");
  //
  //     modalDivClose.setAttribute("class", "modal");
  //     contentDivClose.setAttribute("class", "modal-content");
  //
  //     closeButtonClose.innerHTML = "x";
  //     modalHeaderClose.innerHTML = "Are you sure you want to log out?";
  //     confirmCloseBtn.addEventListener("click", function() {
  //       edgeCMS.app.auth().signOut();
  //     });
  //
  //     closeButtonClose.addEventListener("click", function() {
  //       modalDivClose.style.display = "none";
  //     });
  //
  //     window.onclick = function(event) {
  //       if (event.target == modalDivClose) {
  //         modalDivClose.style.display = "none";
  //       }
  //     }
  //
  //     return modalDivClose;
  //   }
  // }

  // this modal and functions are for editing an edge-cms flagged element
  // containing an href attribute
  var editModalDiv;
  function createLinkEditModal(){
    // creating the div containers for edit modal
    editModalDiv = document.createElement("div");
    var editContentDiv = document.createElement("div");
    var editCloseButton = document.createElement("span");
    var editModalHeader = document.createElement("h3");
    // create the form for editing edge cms links
    var editLinkForm = document.createElement("form");
    var editLinkTextLabel = document.createElement("label");
    var editLinkTextInput = document.createElement("input");
    var editLinkURLLabel = document.createElement("label");
    var editLinkURLInput = document.createElement("input");
    var submitBtn = document.createElement("button");
    //this element does not display and is just for holding
    // the data key of the clicked link
    var editLinkDataKey = document.createElement("p")

    //add classes, id's, etc to form fields
    editLinkForm.style.marginTop = "20px";

    editLinkTextInput.setAttribute("type", "text");
    editLinkTextInput.setAttribute("name", "editLinkText");
    editLinkTextInput.setAttribute("class", "edge-input");
    editLinkTextInput.setAttribute("id", "editLinkText")
    editLinkURLInput.setAttribute("type", "text");
    editLinkURLInput.setAttribute("name", "editLinkURL");
    editLinkURLInput.setAttribute("class", "edge-input");
    editLinkURLInput.setAttribute("id", "editLinkURL");
    submitBtn.setAttribute("type", "submit");
    submitBtn.innerHTML = "Confirm";
    editLinkTextLabel.setAttribute("for", "editLinkText");
    editLinkTextLabel.innerHTML = "Link Text";
    editLinkURLLabel.setAttribute("for", "editLinkURL");
    editLinkURLLabel.innerHTML = "Link URL";
    editLinkDataKey.setAttribute("id","editLinkDataKey");
    editLinkDataKey.style.display = "none";

    //place all form pieces within form
    editLinkForm.appendChild(editLinkTextLabel);
    editLinkForm.appendChild(editLinkTextInput);
    editLinkForm.appendChild(editLinkURLLabel);
    editLinkForm.appendChild(editLinkURLInput);
    editLinkForm.appendChild(editLinkDataKey);
    editLinkForm.appendChild(submitBtn);

    //on submit, change the text/url attributes
    //of the given element
    //Note:  changes aren't saved until save button
    //on the page is clicked
    editLinkForm.onsubmit = function() {
      var newLinkText = editLinkTextInput.value;
      var newLinkURL = editLinkURLInput.value
      var newLinkDataKey = editLinkDataKey.innerHTML;
      // change the html element's attributes
      updateEditLink(newLinkDataKey,newLinkText,newLinkURL);
      // clear form values for next edit
      editLinkTextInput.value = "";
      editLinkURLInput.value = "";
      editLinkDataKey.innerHTML = "";
      // close form
      editModalDiv.style.display = "none";

      return false;
    };

    // add classes/content to general form
    editModalDiv.setAttribute("class", "modal");
    editContentDiv.setAttribute("class", "modal-content");
    editCloseButton.innerHTML = "x";
    editModalHeader.innerHTML = "Edit this link";

    editCloseButton.addEventListener("click", function() {
      editModalDiv.style.display = "none";
    });

    //close modal if clicked outside
    window.onclick = function(event) {
      if (event.target == editModalDiv) {
        editModalDiv.style.display = "none";
      }
    }

    //add form to page
    editContentDiv.appendChild(editCloseButton);
    editContentDiv.appendChild(editModalHeader);
    editContentDiv.appendChild(editLinkForm);
    editModalDiv.appendChild(editContentDiv);
    document.body.appendChild(editModalDiv);
    editModalDiv.style.display = "none";
  }

  function updateEditLink(newLinkDataKey,newLinkText,newLinkURL){
    // grab edge-cms flagged elements to look through
    var editableElements = document.getElementsByClassName("edge-cms");
    // search through elements to find the matching data key
    for (i in editableElements){
      if (editableElements[i].getAttribute("data-key-name") === newLinkDataKey){
        var editThisLink = editableElements[i];
        // make sure new text and url have values before assigning them
        if (newLinkText !== ""){
          editThisLink.innerHTML = newLinkText;
        }
        if (newLinkURL !== ""){
          editThisLink.setAttribute("href", newLinkURL);
        }
        // break out of function once the proper data key is found
        return;
      }
    }
  }


  function showEditLinkModal(){
    var editableLink = $(this);
    if (typeof editableLink.attr('href') !== "undefined" && editableLink.attr('contenteditable') === "true") {
      var linkEditModal = editModalDiv;
      // grab data from link and pass info to modal
      var oldLinkText = editableLink.text();
      var oldLinkURL = editableLink.attr('href');
      var oldLinkDataKey = editableLink.attr('data-key-name');
      $('#editLinkText').attr('placeholder', oldLinkText);
      $('#editLinkURL').attr('placeholder', oldLinkURL);
      $('#editLinkDataKey').text(oldLinkDataKey);
      linkEditModal.style.display = "block";
    }
  }

  $(".edge-cms").on('click', showEditLinkModal);

  //window.onload = function () {
  edgeCMS.begin= function (config) {
    if(config) {
      if(config.firebase) {
        edgeCMS.config.firebase = config.firebase
      }
      if(config.namespace) {
        edgeCMS.config.namespace = config.namespace
      }
      if(config.version) {
        edgeCMS.config.version = config.version
      }
    }
    $.getScript("https://www.gstatic.com/firebasejs/"+ edgeCMS.config.version +"/firebase.js")
      .done(firebaseReady)
      .fail(console.log.bind(console));
    /*
    firebaseReady();
    */
  }

  return edgeCMS;
}());

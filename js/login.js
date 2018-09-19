var loginButton,
    loginText,
    loginErrorText,
    loginInterface,
    loginEmail,
    loginPassword,
    loginUsername;

function initLogin() {
    getLoginElementIds();
    ProfileManager.load(function(u, p) { // the load function executes on load to get a profile that was logged in in the previous session
		login(u, p);
	});
}

function getLoginElementIds() {
    loginButton = document.getElementById("login-button");
    loginText = document.getElementById("login-text");
    loginErrorText = document.getElementById("login-error-text");
    loginInterface = document.getElementById("login-interface");
	loginUsername = document.getElementById("login-username");
    loginEmail = document.getElementById("login-email");
    loginPassword = document.getElementById("login-password"); // this function assigns references to elements through id
}

var Profile = function(username, email, password) { // a class with a constructor for the profile
    this.username = username;
    this.email = email;
    this.password = password;
}

// THE PROFILE MANAGER CAN ACTUALLY BE USED FOR GENERAL PURPOSE AS IT FUNCTIONS INDEPENDENTLY FROM OTHER CODE
var ProfileManager = { // this object holds all profile data and functions
    profileList: new Array(),
    loggedInProfile: null,
    createProfile: function(username, email, password, invalidUsernameFunc, invalidEmailFunc, successFunc) {
		for (var p = 0; p < this.profileList.length; p++) {
			if (username == this.profileList[p].username) { // if the username already exists in the profileList
				invalidUsernameFunc();
				return;
			}
			if (email == this.profileList[p].email) { // if the email already exists in the profileList
				invalidEmailFunc();
				return;
			}
		}
        this.profileList.push(new Profile(username, email, password)); // pushing new profile object into the 'profileList' array
        this.save();
		successFunc();
    },
    login: function(username, password, funcValid, funcInvalid) {
        for (var i = 0; i < this.profileList.length; i++) {
            var p = this.profileList[i];
            if (username == p.username && password == p.password) {
                this.loggedInProfile = p;
                this.save();
                console.log("Logged in as: " + p.username + " with email address " + p.email);
                if (funcValid) funcValid();
                return;
            }
        }
        if (funcInvalid) funcInvalid();
    },
    logout: function() { // logging out simply involves setting the 'loggedInProfile' value to null
        this.loggedInProfile = null;
        this.save();
        location.reload(true); // this refreshes the page
    },
    save: function() {
        Storage.setItem("profileList", JSON.stringify(this.profileList));
        if (this.loggedInProfile != null) {
            Storage.setItem("loggedInProfile", JSON.stringify(this.loggedInProfile));
        } else {
            Storage.setItem("loggedInProfile", this.loggedInProfile);
        }
    },
    load: function(loginFunc) {
        var profileListTemp = Storage.getItem("profileList");
        if (profileListTemp) {
            this.profileList = JSON.parse(profileListTemp);
        }

        loggedInProfileTemp = JSON.parse(Storage.getItem("loggedInProfile"));
        if (loggedInProfileTemp) {
			if (loginFunc) loginFunc(loggedInProfileTemp.username, loggedInProfileTemp.password);
            //login(loggedInProfileTemp.username, loggedInProfileTemp.password);
        } else {
            this.loggedInProfile = null;
        }
    }
}


// this function is called when the login button is pressed
function login(username, password) {
    ProfileManager.login(
        username, password,
        function() { // if profile exists
            loginText.innerHTML = ProfileManager.loggedInProfile.username.toUpperCase();
            loginInterface.innerHTML = "Your account can be used to purchase items from the shop.<button onclick='ProfileManager.logout();'>LOG OUT</button>";
            try {
				Shop.setCanCheckout(true);
			} catch (e) {
				console.log("Not on shop page");
			}
        },
        function() { // if profile does not exist
			if (!username.length || !password.length) {
				loginErrorText.innerHTML = "Please ensure all fields are filled.";
			} else {
				loginErrorText.innerHTML = "Incorrect details or account does not exist.";
			}
        }
    );
}

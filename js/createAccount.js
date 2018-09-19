var minUsernameLength = 3,
    maxUsernameLength = 20,
    invalidUsernameChars = "!@#$%^&*()-+''~?{}[]:;<>,.``";
var minPasswordLength = 8,
    maxPasswordLength = 25,
    invalidPasswordChars = "<>~";
var CAErrorText;

function initCA() {
    CAErrorText = document.getElementById("create-account-error-text");
}

function createAccount() {
    var inputs = document.createAccountForm.elements;
    var errors = new Array();
    for (var i = 0; i < inputs.length; i++) {
        if (inputs[i].value.length < 1) {
            errors.push("Please ensure all fields are filled.");
            break;
        }
    }
	// all error checking takes place here - very similar to the login and checkout error checking
    checkInput(inputs["username"].value,
        minUsernameLength, maxUsernameLength, invalidUsernameChars,
        function() {errors.push("The username must between " + minUsernameLength + " and " + maxUsernameLength + " characters inclusive.");},
        function() {errors.push("The username cannot contain the following characters: " + invalidUsernameChars);}
    );

    checkEmailFormat(inputs["emailAddress"].value, function() {errors.push("The email address must follow the format 'example@mail.com' and not contain symbols.");});

    if (inputs["createPassword"].value != inputs["confirmPassword"].value) {errors.push("Could not verify password.");}

    checkInput(inputs["createPassword"].value,
        minPasswordLength, maxPasswordLength, invalidPasswordChars,
        function() {errors.push("The password must between " + minPasswordLength + " and " + maxPasswordLength + " characters inclusive.");},
        function() {errors.push("The password cannot contain the following characters: " + invalidPasswordChars);}
    );

    if (!inputs["agreeToTerms"].checked) {
        errors.push("You must agree to the terms and conditions.");
    }

    if (errors.length > 0) {
        CAErrorText.innerHTML = "";
        for (var i = 0; i < errors.length; i++) {
            CAErrorText.innerHTML += "" + errors[i] + "<br class='gap'/>";
        }
        CAErrorText.innerHTML += "<br/>";
    } else {
        CAErrorText.innerHTML = "";
        ProfileManager.createProfile(inputs.username.value, inputs.emailAddress.value, inputs.confirmPassword.value,
			function() {alert("An account already exists with that username.");},
			function() {alert("An account already exists with that email address.");},
			function() {alert("Account successfully created. Select 'LOGIN' above to log into new account.");}
		);
    }
}

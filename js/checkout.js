var minNameOnCardLength = 3,
    maxNameOnCardLength = 20,
    invalidNameOnCardChars = "!@#$%^&*()-+''~?{}[]:;<>,.``/=1234567890";

var checkoutErrorText;

function initCheckout() {
    checkoutErrorText = document.getElementById("checkout-error-text");
}

function submitCheckoutForm() { // this function is called when the users confirms after the payment form
    var inputs = document.checkoutForm.elements;
    var errors = new Array(); // this array holdds strings that describe errors

    for (var i = 0; i < inputs.length; i++) {
        if (!inputs[i].value) { // if the a value is falsy (which means it's empty) then all fields have not been filled in
            errors.push("Please ensure all fields are filled.");
            break;
        }
    }
    checkInput(inputs["nameOnCard"].value,
        minNameOnCardLength, maxNameOnCardLength, invalidNameOnCardChars,
        function() {errors.push("The name on card must between " + minNameOnCardLength + " and " + maxNameOnCardLength + " characters inclusive.");},
        function() {errors.push("The name on card cannot contain the following characters:<br/>" + invalidNameOnCardChars);}
    );

    if (isNaN(inputs["cardNumber"].value)) { // isNan returns true if the value is a number
        errors.push("The card number can only contain numerical values.");
    }
    if (inputs["cardNumber"].value.length != 16) { // the credit card number must be 16 chars in length
        errors.push("The card number must contain 16 digits.");
    }
    if (!inputs["expiryDate"].value) {
        errors.push("Select an expiry date.");
    }
    if (isNaN(inputs["cvv"].value)) {
        errors.push("The CVV can only contain numerical values.");
    }
    if (inputs["cvv"].value.length != 3) {
        errors.push("The CVV must contain 3 digits.");
    }

    if (errors.length > 0) { // if the array has contents, then there is an error
        checkoutErrorText.innerHTML = "";
        for (var i = 0; i < errors.length; i++) {
            checkoutErrorText.innerHTML += "" + errors[i] + "<br class='gap'/>";
        }
        checkoutErrorText.innerHTML += "<br/>";
    } else { // if the errors array is empty, then all entries were valid and we can proceed
        checkoutErrorText.innerHTML = "";
        alert("Your order and payment details have been saved with us.\nWe currently do not have shipping services available, so we will email you when we can ship the items to you.");
        PopupInterface.hide();
    }
}

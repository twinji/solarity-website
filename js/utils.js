// THIS FILE CONTAINS GENERAL PURPOSE FUNCTIONS AND OBJECTS

HTMLElement.prototype.removeClass = function(classToRemove) { // this function allows for the easy removal of CSS classes via JS
    var newClassName = "";
    var classList = this.className.split(" "); // ther className holds all of the class references. We search through them to find the class required to delete and not add that
    for (var i = 0; i < classList.length; i++) {
        if (classList[i] !== classToRemove) {
            newClassName += classList[i] + " ";
        }
    }
    this.className = newClassName;
};

HTMLElement.prototype.addClass = function(classToAdd) { // this function adds classes to an element
    this.className += " " + classToAdd;
};

HTMLElement.prototype.hasClass = function(classToCheck) {
    var classList = this.className.split(" ");
    for (var i = 0; i < classList.length; i++) {
        if (classList[i] == classToCheck) {
            return true;
        }
    }
    return false;
};

String.prototype.toUpperCaseFirstChar = function() { // this function capitalizes the first char
    return (this.charAt(0).toUpperCase() + this.slice(1)).toString();
}

var preventParentEvent = function(e) {
    if (!e) var e = window.event;
    e.cancelBubble = true;
    if (e.stopPropagation) e.stopPropagation(); // this function prevents a parent element in HTML from performing actions when it's child is interacted with
}

var Storage = { // this object handles storage and determines when localStorage and cookies are used. localStorage is favored due to its higher memory limit and support for more types of data
	LSCompatible: function() {
		if (window.localStorage !== undefined) { // checking if the localStorage object is available
			return true;
		} else {
			return false;
		} // this function checks whether local storage is available and returns true of false
	},
	setItem: function(key, value) {
		if (this.LSCompatible()) {
			localStorage.setItem(key, value); // if there is localStorage support, we set an item in local storage to the desired key and value parameters
		} else {
            document.cookie = key + "=" + value + "; " + "expires=Fri, 31 Dec 9999 23:59:59 GMT"; // otherwise, the traditional cookie method is used
		}
	},
	getItem: function(key) {
		if (this.LSCompatible()) {
			return localStorage.getItem(key); // localStorage is available so we create call the simple getItem function
		} else { // otherwise the cookie search algorithm is used
            var name = key + "=";
            var cookieParts = document.cookie.split(";");
            for (var i = 0; i < cookieParts.length; i++) {
                var c = cookieParts[i];
                while (c.charAt(0) == " ") c = c.substring(1);
                if (c.indexOf(name) == 0) {
                    return c.substring(name.length, c.length);
                }
            }
            return false;
		}
	}
};

function checkInput(value, minLength, maxLength, invalidChars, lengthFunc, invalidFunc, successFunc) { // this function is described in detail in the documentation
    var hasInvalidError = false,
        hasLengthError = false;
    if (value.length < minLength || value.length > maxLength) {
        if (lengthFunc) lengthFunc();
        hasLengthError = true;
    }
    if (invalidChars) {
        for (var i = 0; i < invalidChars.length; i++) {
            if (!hasInvalidError) {
                for (var v = 0; v < value.length; v++) {
                    if (value[v] == invalidChars[i]) {
                        if (invalidFunc) invalidFunc();
                        hasInvalidError = true;
                        break;
                    }
                }
            }
        }
    }
    if (!hasLengthError && !hasInvalidError) {
        if (successFunc) successFunc();
    }
}

function checkEmailFormat(emailAddress, invalidFunc) { // this function performs error checking for email address - checks the formatting
    var invalidChars = "!#$%^&*()-+''~?{}[]:;<>,``/=";
	for (var i = 0; i < emailAddress.length; i++) {
		for (var j = 0; j < invalidChars.length; j++) {
			if (emailAddress[i] == invalidChars[j]) {
				invalidFunc();
				return;	
			}
		}
	}
	
	var atParts = emailAddress.split("@");
    if (atParts.length != 2) {
        invalidFunc();
        return;
    } else {
        if (!atParts[0].length || !atParts[1].length) {
            invalidFunc();
            return;
        }
        for (var a = 0; a < atParts.length; a++) {
            if (atParts[a].charAt(0) == "." || atParts[a].charAt(atParts[a].length - 1) == ".") {
                invalidFunc();
                return;
            }
            var prevChar = null;
            for (var i = 0; i < atParts[a].length; i++) {
                var char = atParts[a][i];
                if (i == 0) {
                    prevChar = char;
                } else {
                    if (char == "." && prevChar == ".") {
                        invalidFunc();
                        return;
                    } else {
                        prevChar = char;
                    }
                }
            }
        }
    }
}

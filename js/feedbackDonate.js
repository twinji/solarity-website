function submitFeedback() {
    var feedbackTextArea = document.getElementById("feedback-text-area"),
        feedbackMaxChars = 30,
        feedbackMinChars = 5;

    checkInput(feedbackTextArea.value, feedbackMinChars, feedbackMaxChars, null, // checking the length of the inputted data
        function() {
            alert("Your feedback must be between " + feedbackMinChars + " and " + feedbackMaxChars + " characters.");
            return false;
        },
        null,
        function() {
            alert("Your feedback has been submitted. Thank you!");
        }
    );
}

function donate() { // this executes when the donate button is clicked
    alert("Sorry, donations will become available soon!");
}

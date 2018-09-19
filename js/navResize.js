// this script controls the transforming nav bar on the homepage

var nav, cov, navChangeDistance;

document.addEventListener('DOMContentLoaded', function() {
    nav = document.getElementsByTagName("nav")[0];
    cov = document.getElementById("cover");
    navChangeDistance = cov.offsetHeight / 2 - 50;
});

document.onscroll = function() {
    if (document.body.scrollTop > navChangeDistance) {
        nav.className = "opaque";
    } else {
        nav.className = "";
    }
}
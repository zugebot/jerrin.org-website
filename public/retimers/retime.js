// Jerrin Shirks

var vid = document.querySelector("video");
var timestamp;

// loops constantly updating timestamp
function grabTime(time, media) {
    timestamp = media.mediaTime;
    vid.requestVideoFrameCallback(grabTime);
}

addEventListener("keydown", function (event) {
	if (event.key === "t") {
		var input = document.createElement("input");
		input.value = timestamp;
		document.body.appendChild(input);
		input.select();
		document.execCommand("copy");
		document.body.removeChild(input);
        
        setTimeout('alert('Copied!')', 500);
	}
});

alert("click the letter \"t\" to copy a timestamp.");
vid.requestVideoFrameCallback(grabTime);








// Jerrin Shirks

//var vid = document.querySelector("video");
//var timestamp;
//function grabTime(time, media) {
//    timestamp = media.mediaTime;
//    vid.requestVideoFrameCallback(grabTime);
//}

//addEventListener('contextmenu', function (event) {
//	var input = document.createElement("input");
//	input.value = timestamp;
//	document.body.appendChild(input);
//	input.select();
//	document.execCommand("copy");
//	document.body.removeChild(input);
//});

//alert("")

//vid.requestVideoFrameCallback(grabTime);

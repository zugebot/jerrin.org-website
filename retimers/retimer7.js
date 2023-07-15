// Jerrin Shirks, forked from Sprinkz


(function () {
    
    if (window.ezRetime) {
        alert("The script is already running.\nNoob.");
        
    } else {
        window.ezRetime = true;
      
        if (!"requestVideoFrameCallback" in HTMLVideoElement.prototype) {
            window.ezRetime = false;
            throw alert("You are using an invalid browser. Try the latest version of Chrome or your computer will self destruct while trying to run this script.");
        }
      
        if (
            !location.hostname.includes("bilibili.") &&
            !location.hostname.endsWith("twitch.tv") &&
            !location.hostname.endsWith("youtube.com") &&
            !confirm("ezRetime is only meant for use on Bilibili, Twitch, or Youtube.\nWould you like to try to use it anyway?")
        ) {
            window.ezRetime = false;
            throw alert("Terminating...");
        }
      
        var vid = document.querySelector("video");
        var start_time, end_time, last_media_time, last_frame_num;
        var fps_rounder = [];
        var fps = 60;
        var frame_not_seeked = true;
        
      
        if (!vid) {
            window.ezRetime = false;
            throw alert("No video was found on this page.\nTerminating...");
        }
      
        alert('Retimer has been activated!\nTap "t" to copy current time.\nUse the "," and "." keys to move through frames of the video');

        
        vid.addEventListener("seeked", function () {
            console.log('seeked this frame')
            fps_rounder.pop()
            frame_not_seeked = false;
        });

        
        
        function o(t, media) {
            var media_time_diff = Math.abs(media.mediaTime - last_media_time);
            var frame_num_diff  = Math.abs(media.presentedFrames - last_frame_num);
            var diff = media_time_diff / frame_num_diff;

            // figures out the fps ...
            if (!vid.paused && diff && media_time_diff && frame_not_seeked && fps_rounder.length < 50 && vid.playbackRate === 1) {
                fps_rounder.push(diff);
                fps = Math.round(1 / a(fps_rounder));
            }
            
            console.log(fps);
            console.log(fps_rounder);
            frame_not_seeked = true;
            last_media_time = media.mediaTime;
            last_frame_num = media.presentedFrames;

            // loops constantly updating timestamp
            vid.requestVideoFrameCallback(o);
        }
        // starts the feedback loop of fetching time
        vid.requestVideoFrameCallback(o);


        
        // adds functionality of moving frames with ','-left and '.'-right.
        addEventListener("keydown", function (e) {
        
            if (event.key === ",") {
                if (!location.hostname.endsWith("youtube.com")) {
                    vid.currentTime -= 1 / fps; // assumes 60fps at first, then gets more accurate
                    vid.playbackRate = 1;
                    return false; // stupid twitch
                }
            }

            if (event.key === ".") {
                if (!location.hostname.endsWith("youtube.com")) {
                    vid.currentTime += 1 / fps; // assumes 60fps at first, then gets more accurate
                    vid.playbackRate = 1;
                    return false; // stupid twitch
                }
            }

            if (event.key === "t") {
        		var input = document.createElement("input");
        		input.value = last_media_time;
        		document.body.appendChild(input);
        		input.select();
        		document.execCommand("copy");
        		document.body.removeChild(input);
                
                alert('Copied! ' + m(last_media_time));
	}

            
        
        }); // End of EventListener()


    // formats an n amount of seconds into a time.
    function m(s) {
        s = Math.round(s * fps) / fps; // turn .666 into .667 etc to match youtube frame timer
        return (s - (s %= 60)) / 60 + (10 < s ? ":" : ":0") + s.toFixed(3);
    }

    // who knows what this does!!!!!
    function a(s) {
        return s.reduce((a, b) => a + b) / s.length;
    }

      
  }
    
})();
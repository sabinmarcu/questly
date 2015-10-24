chrome.app.runtime.onLaunched.addListener(function() {
    chrome.app.window.create("chrome/index.html", {
        "outerBounds": {
            "height": 400,
            "width": 600,
        },
        "frame": "none",
        // "state": "fullscreen",
    });
});

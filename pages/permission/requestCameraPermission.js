(function () {
  "use strict";
  navigator.mediaDevices
    .getUserMedia({ audio: false, video: { facingMode: "user", width: 600, height: 600, frameRate: 30 } })
    .then(function (stream) {
      window.parent.postMessage({
        action: "mobot-permission_iframe_message",
        message: "permission_granted",
        type: "camera",
      }, "*");
      var video = document.getElementById("video");
      if (video) {
        video.srcObject = stream;
        video.play().catch(function () {});
      }
    })
    .catch(function (error) {
      window.parent.postMessage({
        action: "mobot-permission_iframe_message",
        message: "permission_denied",
        error: String(error),
        type: "camera",
      }, "*");
    });
})();

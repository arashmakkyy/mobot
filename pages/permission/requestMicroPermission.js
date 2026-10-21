(function () {
  "use strict";
  var microphoneDeviceId = null;

  function initMicrophone() {
    navigator.mediaDevices
      .getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          deviceId: microphoneDeviceId ? { exact: microphoneDeviceId } : undefined,
        },
        video: false,
      })
      .then(function (stream) {
        navigator.mediaDevices
          .enumerateDevices()
          .then(function (devices) {
            var devicesRaw = devices
              .filter(function (device) { return device.kind === "audioinput" && device.deviceId; })
              .map(function (device) { return { label: device.label, deviceId: device.deviceId }; });
            var defaultIndex = devicesRaw.findIndex(function (device) { return device.deviceId === "default"; });
            if (defaultIndex > 0) {
              var defaultDevice = devicesRaw.splice(defaultIndex, 1)[0];
              devicesRaw.unshift(defaultDevice);
            }
            window.parent.postMessage({
              action: "mobot-permission_iframe_message",
              message: "devices_list",
              type: "microphone",
              devices: devicesRaw,
            }, "*");
          })
          .catch(function () {});

        var wrapper = document.querySelector("#slider-wrapper");
        var slider = wrapper ? wrapper.querySelector("div") : null;
        if (wrapper) wrapper.style.display = "block";
        var AudioContextClass = window.AudioContext || window.webkitAudioContext;
        if (AudioContextClass && slider) {
          var audioContext = new AudioContextClass();
          var source = audioContext.createMediaStreamSource(stream);
          var analyser = audioContext.createAnalyser();
          analyser.fftSize = 256;
          source.connect(analyser);
          var dataArray = new Uint8Array(analyser.fftSize);
          (function update() {
            analyser.getByteTimeDomainData(dataArray);
            var sum = 0;
            for (var i = 0; i < dataArray.length; i += 1) {
              var value = (dataArray[i] - 128) / 128;
              sum += value * value;
            }
            var level = Math.min(1, Math.sqrt(sum / dataArray.length) * 5);
            slider.style.width = Math.round(level * 100) + "%";
            requestAnimationFrame(update);
          })();
        }

        window.parent.postMessage({
          action: "mobot-permission_iframe_message",
          message: "permission_granted",
          type: "microphone",
        }, "*");
      })
      .catch(function (error) {
        window.parent.postMessage({
          action: "mobot-permission_iframe_message",
          message: "permission_denied",
          error: String(error),
          type: "microphone",
        }, "*");
      });
  }

  initMicrophone();
  window.addEventListener("message", function (event) {
    if (
      event.data &&
      event.data.action === "mobot-permission_iframe_message" &&
      event.data.type === "microphone" &&
      event.data.message === "change_default_microphone"
    ) {
      microphoneDeviceId = event.data.deviceId;
      initMicrophone();
    }
  });
})();

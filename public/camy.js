const width = 1280; // We will scale the photo width to this
let height = 0; // This will be computed based on the input stream

let streaming = false;

const video = document.getElementById("video");
const canvas = document.getElementById("canvas");
const photo = document.getElementById("photo");
const lastUpload = document.getElementById("last-upload");
const startButton = document.getElementById("start-button");
const allowButton = document.getElementById("permissions-button");

// Functions

function clearPhoto() {
  const context = canvas.getContext("2d");
  context.fillStyle = "#aaaaaa";
  context.fillRect(0, 0, canvas.width, canvas.height);

  const data = canvas.toDataURL("image/png");
  photo.setAttribute("src", data);
}

function startStream() {
  navigator.mediaDevices
    .getUserMedia({ video: true, audio: false })
    .then((stream) => {
      video.srcObject = stream;
      video.play();

      video.addEventListener('loadedmetadata', (e) => stream.getVideoTracks()[0]
        .applyConstraints({ advanced: [{ torch: true }]})
      );

    })
    .catch((err) => {
      console.error(`An error occurred: ${err}`);
    });
}

function takePicture() {
  const context = canvas.getContext("2d");
  if (!width || !height) {
    clearPhoto();
    return;
  }

  canvas.width = width;
  canvas.height = height;

  // Get the computed CSS filter from the video element.
  // For example, it might return "grayscale(100%)"
  const videoStyles = window.getComputedStyle(video);
  const filterValue = videoStyles.getPropertyValue("filter");

  // Apply the filter to the canvas drawing context.
  // If there's no filter (i.e., it returns "none"), default to "none".
  context.filter = filterValue !== "none" ? filterValue : "none";

  context.drawImage(video, 0, 0, width, height);

  const dataUrl = canvas.toBlob((blob) => {
    console.log("uploading");
    if (blob) {
      uploadBlob(blob);
    } else {
      console.error('Failed to create blob from canvas');
    }
  });
  photo.setAttribute("src", canvas.toDataURL("image/png"));
}

// Upload a Blob as a multipart/form-data POST with field name `image` to upload.php
function uploadBlob(blob) {
  const form = new FormData();
  const filename = `capture-${Date.now()}.png`;
  form.append('image', blob, filename);

  fetch('upload.php', {
    method: 'POST',
    body: form,
  })
    .then((res) => res.text())
    .then((text) => {
      console.log('Upload response:', text);
      lastUpload.textContent = new Date().toISOString();
    })
    .catch((err) => {
      console.error('Upload failed:', err);
    });
}

// Event listeners

video.addEventListener("canplay", (ev) => {
  if (streaming) {
    return;
  }

  height = video.videoHeight / (video.videoWidth / width);

  video.setAttribute("width", width);
  video.setAttribute("height", height);
  canvas.setAttribute("width", width);
  canvas.setAttribute("height", height);
  streaming = true;
});

startButton.addEventListener("click", (ev) => {
  takePicture();
  ev.preventDefault();
});

// Setup

clearPhoto();
startStream()
navigator.wakeLock.request("screen")
.then(() => {
  console.log("Wake Lock is active!");
}).catch((err) => {
  // The Wake Lock request has failed - usually system related, such as battery.
  console.error(`${err.name}, ${err.message}`);
});

setInterval(() => { takePicture(); }, 60000);

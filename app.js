// More API functions here:
// https://github.com/googlecreativelab/teachablemachine-community/tree/master/libraries/image
let running = false;
let paused = false;

const startButton = document.getElementById("startButton");
startButton.addEventListener("click", init);

const pauseButton = document.getElementById("pauseButton");
pauseButton.addEventListener("click", pause);

const webcamContainer = document.getElementById("webcam-container");

// the link to your model provided by Teachable Machine export panel
const URL = "./my_model/";

let model, webcam, labelContainer, maxPredictions;

// Load the image model and setup the webcam
async function init() {
  console.log("running :", running);
  if (!running) {
    running = true;
    startButton.innerText = "Stop Camera";
    const modelURL = URL + "model.json";
    const metadataURL = URL + "metadata.json";

    // load the model and metadata
    // Refer to tmImage.loadFromFiles() in the API to support files from a file picker
    // or files from your local hard drive
    // Note: the pose library adds "tmImage" object to your window (window.tmImage)
    model = await tmImage.load(modelURL, metadataURL);
    maxPredictions = model.getTotalClasses();

    // Convenience function to setup a webcam
    const flip = true; // whether to flip the webcam
    webcam = new tmImage.Webcam(200, 200); // width, height, flip
    await webcam.setup({ facingMode: "environment" }); // request access to the webcam
    await webcam.play();
    window.requestAnimationFrame(loop);

    // append elements to the DOM
    webcamContainer.appendChild(webcam.canvas);
    labelContainer = document.getElementById("label-container");
    for (let i = 0; i < maxPredictions; i++) {
      // and class labels
      labelContainer.appendChild(document.createElement("div"));
    }
  } else {
    running = false;
    document.getElementById("webcam-container").innerHTML = "";
    labelContainer.innerHTML = "";
    webcamContainer.style.borderColor = "white";

    startButton.innerText = "Start Camera";
  }
}

async function pause() {
  if (!paused) {
    paused = true;
    console.log("clicked");
    await webcam.pause();
    pauseButton.innerText = "Play Camera";
  } else {
    paused = false;
    console.log("clicked again");
    await webcam.play();
  }
}

async function loop() {
  webcam.update(); // update the webcam frame
  await predict();
  window.requestAnimationFrame(loop);
}

// run the webcam image through the image model
async function predict() {
  const colours = {
    "A phone": "red",
    "Thumbs up": "green",
    "Thumbs down": "blue",
  };

  // predict can take in an image, video or canvas html element
  const prediction = await model.predict(webcam.canvas);

  for (let i = 0; i < maxPredictions; i++) {
    const thePrediction = prediction[i].probability.toFixed(1) * 100;

    if (thePrediction > 85 && running) {
      const classPrediction = prediction[i].className;
      labelContainer.childNodes[i].innerHTML =
        classPrediction + ": " + thePrediction;
      labelContainer.childNodes[i].style.backgroundColor = "green";
      webcamContainer.style.borderColor = colours[classPrediction];
    } else {
      labelContainer.childNodes[i].style.backgroundColor = "";
      const classPrediction = prediction[i].className + ": " + thePrediction;
      labelContainer.childNodes[i].innerHTML = "No match";
    }
  }
}

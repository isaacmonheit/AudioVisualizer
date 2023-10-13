const audioContext = new (window.AudioContext || window.webkitAudioContext)();
let sourceNode;
let analyser = audioContext.createAnalyser();
const canvas = document.getElementById('canvas');
const canvasContext = canvas.getContext('2d');

canvasContext.fillStyle = "#00ff00";  // Green bars, you can change the color to match the image
canvasContext.strokeStyle = "#00ff00";  // Green outline, adjust as necessary


function getMicInput() {
    navigator.mediaDevices.getUserMedia({ audio: true })
        .then(stream => {
            sourceNode = audioContext.createMediaStreamSource(stream);
            sourceNode.connect(analyser);
            draw();
        })
        .catch(err => console.log(err));
}

document.getElementById('audioFileInput').addEventListener('change', function() {
    const file = this.files[0];
    const audioPlayer = document.getElementById('audioPlayer');
    const audioControls = document.getElementById('audioControls');
    // const stopButton = document.getElementById('stopAudio');
    // const volumeSlider = document.getElementById('volumeSlider');

    // Set the source of the audio player and display the controls
    audioPlayer.src = URL.createObjectURL(file);
    audioControls.style.display = 'block';

    audioPlayer.onplay = function() {
        const source = audioContext.createMediaElementSource(audioPlayer);
        source.connect(analyser);
        analyser.connect(audioContext.destination); // This line ensures you hear the audio as well.
        draw();
    }
    // Play the audio
    audioPlayer.play();

    // Adjust the volume of the audio player based on the slider
    // volumeSlider.addEventListener('input', function() {
    //     audioPlayer.volume = volumeSlider.value;
    // });

    // Stop the audio and clear the source when the stop button is clicked
    // stopButton.addEventListener('click', function() {
    //     audioPlayer.pause();
    //     audioPlayer.currentTime = 0;  // Reset to start
    // });
});



const lastHeights = new Array(analyser.frequencyBinCount).fill(0);
const decayRate = 2;  // This determines how fast the bars fall. Adjust as necessary.

function draw() {
    const dataArray = new Uint8Array(analyser.frequencyBinCount);

    function drawFrame() {
        requestAnimationFrame(drawFrame);
        
        analyser.getByteFrequencyData(dataArray);

        canvasContext.clearRect(0, 0, canvas.width, canvas.height);
        canvasContext.fillStyle = 'green';  // Ensuring bars are green

        for(let i = 0; i < dataArray.length; i++) {
            // Determine the height of the bar
            let barHeight;
            if(dataArray[i] > lastHeights[i]) {
                barHeight = dataArray[i];
                lastHeights[i] = dataArray[i];
            } else {
                barHeight = Math.max(lastHeights[i] - decayRate, dataArray[i]);
                lastHeights[i] = barHeight;
            }

            // Draw the bar
            canvasContext.fillRect(i * 3, canvas.height - barHeight, 2, barHeight);
        }
    }

    drawFrame();
}


function toggleMic() {
    const micButton = document.querySelector('button');

    if (sourceNode) { 
        sourceNode.disconnect();
        if (typeof sourceNode.stop === 'function') { 
            sourceNode.stop();
        }
        sourceNode = null;
        micButton.textContent = "Toggle Microphone Input"; 
    } else {
        // Clear the file input when microphone is toggled on
        // document.getElementById('audioFileInput').value = "";
        getMicInput();
        micButton.textContent = "Stop Microphone Input"; 
    }
}


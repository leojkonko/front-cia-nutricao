// Variable to control if recognition has already been started
let recognitionStarted = false;

// Fix for WebSpeech API
// Add this check before starting recognition
const safeStartRecognition = (recognition: any) => {
    if (!recognitionStarted) {
        recognitionStarted = true;
        try {
            recognition.start();
            console.log("Recognition safely started");
            return true;
        } catch (err) {
            console.error("Error starting recognition:", err);
            return false;
        }
    }
    return false;
};

export { safeStartRecognition };

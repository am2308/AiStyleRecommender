# Face-API.js Model Files

This directory should contain the face-api.js model files needed for face detection and landmark recognition.

## Required Files

Download the following files from the face-api.js GitHub repository and place them in this directory:

1. **Tiny Face Detector Model**
   - tiny_face_detector_model-weights_manifest.json
   - tiny_face_detector_model-shard1

2. **Face Landmark Model**
   - face_landmark_68_model-weights_manifest.json
   - face_landmark_68_model-shard1

3. **Face Recognition Model**
   - face_recognition_model-weights_manifest.json
   - face_recognition_model-shard1
   - face_recognition_model-shard2

## How to Download

You can download these files from:
https://github.com/justadudewhohacks/face-api.js/tree/master/weights

## Alternative Method

If you're having trouble downloading the files individually, you can:

1. Clone the face-api.js repository:
   ```
   git clone https://github.com/justadudewhohacks/face-api.js.git
   ```

2. Copy the files from the `weights` directory to this directory.

## Creating the Directory Structure

If the models directory doesn't exist, create it:

```
mkdir -p public/models
```

Then place the downloaded model files in this directory.

## Troubleshooting

If you're experiencing issues with face detection:

1. Make sure all model files are correctly placed in this directory
2. Check browser console for any errors related to loading the models
3. Try using the AR mode which doesn't require these model files
4. Ensure your image has a clearly visible face in good lighting
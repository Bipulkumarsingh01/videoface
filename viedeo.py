import cv2
import numpy as np
from moviepy.editor import VideoFileClip, ImageSequenceClip

# Load the input video
cap = cv2.VideoCapture('sahil-test1.mp4')
if not cap.isOpened():
    print("Error: Could not open video file")
    exit()

# Load the Haar Cascade Classifier for face detection
trained_face_data = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_frontalface_default.xml')

# Initialize variables for tracking the face position
prev_x, prev_y, prev_w, prev_h = None, None, None, None
smoothed_center_x, smoothed_center_y = None, None
smoothing_factor = 0.001  # Adjust this value to control the amount of smoothing

# Create an empty list to store the cropped frames
cropped_frames = []

while True:
    ret, frame = cap.read()
    if not ret:
        break

    gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
    faces = trained_face_data.detectMultiScale(gray, scaleFactor=1.3, minNeighbors=5)

    if len(faces) > 0:
        x, y, w, h = faces[0]
        center_x, center_y = x + w/2, y + h/2

        # Smooth the center position
        if smoothed_center_x is None or smoothed_center_y is None:
            smoothed_center_x, smoothed_center_y = center_x, center_y
        else:
            smoothed_center_x = (1 - smoothing_factor) * smoothed_center_x + smoothing_factor * center_x
            smoothed_center_y = (1 - smoothing_factor) * smoothed_center_y + smoothing_factor * center_y

        prev_x, prev_y, prev_w, prev_h = x, y, w, h
    else:
        if prev_x is not None:
            center_x, center_y = prev_x + prev_w/2, prev_y + prev_h/2
            smoothed_center_x, smoothed_center_y = center_x, center_y

    if smoothed_center_x is not None and smoothed_center_y is not None:
        crop_width, crop_height = min(frame.shape[1], frame.shape[0] * 9/16), min(frame.shape[0], frame.shape[1] * 9/16)
        crop_x = max(0, min(smoothed_center_x - crop_width/2, frame.shape[1] - crop_width))
        crop_y = max(0, min(smoothed_center_y - crop_height/2, frame.shape[0] - crop_height))

        standard_width, standard_height = 640, 1080
        crop_frame = frame[int(crop_y):int(crop_y + crop_height), int(crop_x):int(crop_x + crop_width)]
        resized_frame = cv2.resize(crop_frame, (standard_width, standard_height))
        rgb_frame = cv2.cvtColor(resized_frame, cv2.COLOR_BGR2RGB)
        cropped_frames.append(rgb_frame)

    if cv2.waitKey(1) & 0xFF == ord('q'):
        break

cap.release()
cv2.destroyAllWindows()

original_video = VideoFileClip('sahil-test1.mp4')
audio = original_video.audio

if cropped_frames:
    final_clip = ImageSequenceClip(cropped_frames, fps=30)  # Adjust fps if needed
    final_clip = final_clip.set_audio(audio)
    final_clip.write_videofile('output_video_with_audio.mp4', fps=30, codec='libx264', audio_codec='aac')
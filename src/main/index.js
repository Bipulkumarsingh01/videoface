// src/main/index.js
import React, { useState } from "react";
import {
  Button,
  CircularProgress,
  Container,
  Typography,
  Paper,
} from "@mui/material";

import "./style.css"; // Import your styles

const App = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [processedVideo, setProcessedVideo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [downloadMessage, setDownloadMessage] = useState("");

  const handleFileChange = (event) => {
    setSelectedFile(event.target.files[0]);
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      alert("Please select a video file.");
      return;
    }

    const formData = new FormData();
    formData.append("video", selectedFile);

    setLoading(true);

    try {
      const response = await fetch("http://localhost:5000/process_video", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();
      setProcessedVideo(data.output_path);
      setDownloadMessage("");
    } catch (error) {
      console.error("Error uploading video:", error);
      alert("Error uploading video. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // const handleDownload = async () => {
  //   if (processedVideo) {
  //     try {
  //       const response = await fetch(`http://localhost:5000/download`); // Replace this line
  //       const message = await response.text();
  //       setDownloadMessage(message);
  //     } catch (error) {
  //       console.error("Error downloading video:", error);
  //       alert("Error downloading video. Please try again.");
  //     }
  //   } else {
  //     alert("No processed video available for download.");
  //   }
  // };

  const handleDownload = async () => {
    if (processedVideo) {
      try {
        const response = await fetch(`http://localhost:5000/download`);

        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }

        // Create a Blob from the response
        const blob = await response.blob();

        // Create a link element and click it to trigger the download
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "processed_video.mp4";
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);

        setDownloadMessage("Download successful!");
      } catch (error) {
        console.error("Error downloading video:", error);
        alert("Error downloading video. Please try again.");
      }
    } else {
      alert("No processed video available for download.");
    }
  };

  return (
    <Container className="container">
      <Typography variant="h4" align="center" gutterBottom>
        Bigbuddy AI
      </Typography>
      <Paper className="videoContainer">
        <input type="file" accept="video/*" onChange={handleFileChange} />
        <Button variant="contained" color="primary" onClick={handleUpload}>
          Upload
        </Button>
        {loading && <CircularProgress className="progress" />}

        {processedVideo && (
          <>
            <video controls className="videoPlayer">
              <source src={processedVideo} type="video/mp4" />
              Your browser does not support the video tag.
            </video>
            {downloadMessage && (
              <Typography variant="body1" className="downloadMessage">
                {downloadMessage}
              </Typography>
            )}
            <Button
              variant="contained"
              color="primary"
              className="downloadButton"
              onClick={handleDownload}
            >
              Download Processed Video
            </Button>
          </>
        )}
      </Paper>
    </Container>
  );
};

export default App;

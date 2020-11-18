import React, { Component } from 'react'
import * as faceapi from 'face-api.js'
import './App.css'

class App extends Component {

  constructor() {
    super()
    this.state = {
      peopleTracked: 0
    }
    this.startTracking = this.startTracking.bind(this)
  }

  startVideo() {
    const video = document.getElementById('video')

    navigator.mediaDevices.getUserMedia({ 
      video: true 
    }).then(stream => video.srcObject = stream).catch(err => console.error(err))
  }

  startTracking(e) {
    const video = e.target
    const canvas = faceapi.createCanvasFromMedia(video)
    const displaySize = { width: video.width, height: video.height }

    document.querySelector('.video-container').append(canvas)

    faceapi.matchDimensions(canvas, displaySize)
    setInterval(async () => {
      const detections = await faceapi.detectAllFaces(video, new faceapi.TinyFaceDetectorOptions()).withFaceLandmarks().withFaceExpressions()
      const resizedDetections = faceapi.resizeResults(detections, displaySize)

      this.setState({
        peopleTracked: detections.length
      })

      canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height)

      faceapi.draw.drawFaceLandmarks(canvas, resizedDetections)
      //faceapi.draw.drawDetections(canvas, resizedDetections)
      //faceapi.draw.drawFaceExpressions(canvas, resizedDetections)
    }, 100)
  }

  async componentDidMount() {
    Promise.all([
      faceapi.loadTinyFaceDetectorModel('/models'),
      faceapi.nets.faceLandmark68Net.loadFromUri('/models'),
      faceapi.nets.faceRecognitionNet.loadFromUri('/models'),
      faceapi.loadFaceExpressionModel('/models')
    ]).then(this.startVideo)
  }
  
  render() {
    return (
      <div className="App">
        <h1>Tracking: { this.state.peopleTracked }</h1>
        <div className="video-container">
          <video id="video" width="720" height="560" autoPlay onPlay={this.startTracking} muted></video>
        </div>
      </div>
    )
  }
}

export default App;

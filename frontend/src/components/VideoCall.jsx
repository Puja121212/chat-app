import { useState, useRef, useEffect } from 'react';
import { FiPhone, FiPhoneOff, FiVideo, FiVideoOff, FiMic, FiMicOff, FiMonitor, FiMaximize, FiMinimize } from 'react-icons/fi';

const VideoCall = ({ currentChat, onEndCall, socket }) => {
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [callStatus, setCallStatus] = useState('connecting'); // connecting, connected, ended
  const [callDuration, setCallDuration] = useState(0);
  
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const localStreamRef = useRef(null);
  const remoteStreamRef = useRef(null);
  const peerConnectionRef = useRef(null);
  const callIntervalRef = useRef(null);

  useEffect(() => {
    startCall();
    return () => {
      endCall();
    };
  }, []);

  useEffect(() => {
    if (callStatus === 'connected') {
      callIntervalRef.current = setInterval(() => {
        setCallDuration(prev => prev + 1);
      }, 1000);
    } else {
      if (callIntervalRef.current) {
        clearInterval(callIntervalRef.current);
      }
    }
    return () => {
      if (callIntervalRef.current) {
        clearInterval(callIntervalRef.current);
      }
    };
  }, [callStatus]);

  const startCall = async () => {
    try {
      // Check if mediaDevices is available
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        alert('Your browser does not support video calling. Please use a modern browser like Chrome, Firefox, or Safari.');
        setCallStatus('ended');
        return;
      }

      // Get local media stream with better constraints
      const localStream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280, max: 1920 },
          height: { ideal: 720, max: 1080 },
          facingMode: 'user',
          echoCancellation: true,
          noiseSuppression: true
        },
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 44100
        }
      });
      
      localStreamRef.current = localStream;
      
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = localStream;
      }

      // Create peer connection
      const configuration = {
        iceServers: [
          { urls: 'stun:stun.l.google.com:19302' },
          { urls: 'stun:stun1.l.google.com:19302' }
        ]
      };
      
      const peerConnection = new RTCPeerConnection(configuration);
      peerConnectionRef.current = peerConnection;

      // Add local stream to peer connection
      localStream.getTracks().forEach(track => {
        peerConnection.addTrack(track, localStream);
      });

      // Handle remote stream
      peerConnection.ontrack = (event) => {
        const remoteStream = event.streams[0];
        remoteStreamRef.current = remoteStream;
        
        if (remoteVideoRef.current) {
          remoteVideoRef.current.srcObject = remoteStream;
        }
        setCallStatus('connected');
      };

      // Handle ICE candidates
      peerConnection.onicecandidate = (event) => {
        if (event.candidate) {
          // Send ICE candidate to other peer via socket
          socket?.emit('ice-candidate', {
            candidate: event.candidate,
            chatId: currentChat?._id
          });
        }
      };

      // Create and send offer
      const offer = await peerConnection.createOffer();
      await peerConnection.setLocalDescription(offer);
      
      socket?.emit('call-offer', {
        offer: offer,
        chatId: currentChat?._id,
        callerId: JSON.parse(localStorage.getItem('user'))?._id
      });

      // Listen for socket events
      socket?.on('call-answer', async ({ answer }) => {
        await peerConnection.setRemoteDescription(answer);
      });

      socket?.on('ice-candidate', async ({ candidate }) => {
        await peerConnection.addIceCandidate(candidate);
      });

    } catch (error) {
      console.error('Error starting call:', error);
      if (error.name === 'NotAllowedError') {
        alert('Camera and microphone access denied. Please allow access in your browser settings to make video calls.');
      } else if (error.name === 'NotFoundError') {
        alert('No camera or microphone found. Please connect a camera and microphone and try again.');
      } else if (error.name === 'NotReadableError') {
        alert('Camera or microphone is already in use by another application. Please close other applications and try again.');
      } else {
        alert('Failed to start video call. Please check your camera and microphone settings and try again.');
      }
      setCallStatus('ended');
    }
  };

  const endCall = () => {
    // Stop local stream
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => track.stop());
    }

    // Close peer connection
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
    }

    // Clear interval
    if (callIntervalRef.current) {
      clearInterval(callIntervalRef.current);
    }

    setCallStatus('ended');
    
    // Notify other user
    socket?.emit('call-ended', {
      chatId: currentChat?._id,
      callerId: JSON.parse(localStorage.getItem('user'))?._id
    });

    setTimeout(() => {
      onEndCall();
    }, 1000);
  };

  const toggleVideo = () => {
    if (localStreamRef.current) {
      const videoTrack = localStreamRef.current.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsVideoEnabled(videoTrack.enabled);
      }
    }
  };

  const toggleAudio = () => {
    if (localStreamRef.current) {
      const audioTrack = localStreamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsAudioEnabled(audioTrack.enabled);
      }
    }
  };

  const toggleScreenShare = async () => {
    if (!isScreenSharing) {
      try {
        // Check if getDisplayMedia is available
        if (!navigator.mediaDevices || !navigator.mediaDevices.getDisplayMedia) {
          alert('Your browser does not support screen sharing. Please use a modern browser like Chrome, Firefox, or Edge.');
          return;
        }

        const screenStream = await navigator.mediaDevices.getDisplayMedia({
          video: {
            cursor: 'always',
            displaySurface: 'monitor'
          },
          audio: {
            echoCancellation: true,
            noiseSuppression: true
          }
        });
        
        const videoTrack = screenStream.getVideoTracks()[0];
        
        if (peerConnectionRef.current) {
          const sender = peerConnectionRef.current.getSenders().find(
            s => s.track && s.track.kind === 'video'
          );
          
          if (sender) {
            await sender.replaceTrack(videoTrack);
          }
        }

        if (localVideoRef.current) {
          localVideoRef.current.srcObject = screenStream;
        }

        setIsScreenSharing(true);

        videoTrack.onended = () => {
          setIsScreenSharing(false);
          // Switch back to camera
          startCall();
        };

        videoTrack.addEventListener('mute', () => {
          setIsScreenSharing(false);
          startCall();
        });

      } catch (error) {
        console.error('Error sharing screen:', error);
        if (error.name === 'NotAllowedError') {
          alert('Screen sharing permission denied. Please allow screen sharing in your browser.');
        } else if (error.name === 'NotSupportedError') {
          alert('Screen sharing is not supported in your browser. Please use Chrome, Firefox, or Edge.');
        } else {
          alert('Failed to share screen. Please try again.');
        }
      }
    } else {
      // Switch back to camera
      startCall();
      setIsScreenSharing(false);
    }
  };

  const toggleFullScreen = () => {
    if (!isFullScreen) {
      document.documentElement.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
    setIsFullScreen(!isFullScreen);
  };

  const formatCallDuration = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  if (callStatus === 'ended') {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <FiPhoneOff className="w-8 h-8 text-white" />
          </div>
          <h3 className="text-white text-xl font-semibold mb-2">Call Ended</h3>
          <p className="text-gray-300 mb-4">Duration: {formatCallDuration(callDuration)}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black z-50">
      {/* Remote Video (Full Screen) */}
      <div className="relative w-full h-full">
        <video
          ref={remoteVideoRef}
          autoPlay
          playsInline
          className="w-full h-full object-cover"
        />
        
        {/* Call Status Overlay */}
        {callStatus === 'connecting' && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
                <FiPhone className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-white text-xl font-semibold">Calling {currentChat?.username}...</h3>
            </div>
          </div>
        )}

        {/* Local Video (Picture-in-Picture) */}
        <div className="absolute top-4 right-4 w-48 h-36 bg-gray-800 rounded-lg overflow-hidden shadow-lg">
          <video
            ref={localVideoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover"
          />
        </div>

        {/* Call Info */}
        <div className="absolute top-4 left-4 text-white">
          <h3 className="text-xl font-semibold">{currentChat?.username}</h3>
          <p className="text-sm text-gray-300">
            {callStatus === 'connecting' ? 'Connecting...' : formatCallDuration(callDuration)}
          </p>
        </div>

        {/* Call Controls */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-6">
          <div className="flex justify-center space-x-4">
            <button
              onClick={toggleAudio}
              className={`p-4 rounded-full transition ${
                isAudioEnabled 
                  ? 'bg-gray-700 hover:bg-gray-600 text-white' 
                  : 'bg-red-500 hover:bg-red-600 text-white'
              }`}
            >
              {isAudioEnabled ? <FiMic className="w-6 h-6" /> : <FiMicOff className="w-6 h-6" />}
            </button>

            <button
              onClick={toggleVideo}
              className={`p-4 rounded-full transition ${
                isVideoEnabled 
                  ? 'bg-gray-700 hover:bg-gray-600 text-white' 
                  : 'bg-red-500 hover:bg-red-600 text-white'
              }`}
            >
              {isVideoEnabled ? <FiVideo className="w-6 h-6" /> : <FiVideoOff className="w-6 h-6" />}
            </button>

            <button
              onClick={toggleScreenShare}
              className={`p-4 rounded-full transition ${
                isScreenSharing 
                  ? 'bg-blue-500 hover:bg-blue-600 text-white' 
                  : 'bg-gray-700 hover:bg-gray-600 text-white'
              }`}
            >
              <FiMonitor className="w-6 h-6" />
            </button>

            <button
              onClick={toggleFullScreen}
              className="p-4 bg-gray-700 hover:bg-gray-600 text-white rounded-full transition"
            >
              {isFullScreen ? <FiMinimize className="w-6 h-6" /> : <FiMaximize className="w-6 h-6" />}
            </button>

            <button
              onClick={endCall}
              className="p-4 bg-red-500 hover:bg-red-600 text-white rounded-full transition"
            >
              <FiPhoneOff className="w-6 h-6" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoCall;

const socket = io("/");
const chatInputBox = document.getElementById("chat-message");
const all_messages = document.getElementById("all-messages");
const main__chat__window = document.getElementById("main-chat-window");
const videoGrid = document.getElementById("video-grid");
const myVideo = document.createElement("video");
myVideo.muted = true;
const peers={};
var peer = new Peer(undefined, {
  path: "/peerjs",
  host: "/",
  port: "443",
});

let myVideoStream;
const user=prompt("Enter Your Name:"); /* */
var getUserMedia =
  navigator.getUserMedia ||
  navigator.webkitGetUserMedia ||
  navigator.mozGetUserMedia;

navigator.mediaDevices
  .getUserMedia({
    video: true,
    audio: true,
  })
  .then((stream) => {
    myVideoStream = stream;
    addVideoStream(myVideo, stream);

    peer.on("call", (call) => {
      call.answer(stream);
      const video = document.createElement("video");

      call.on("stream", (userVideoStream) => {
        addVideoStream(video, userVideoStream);
      });
    });

    socket.on("user-connected", (userId) => {
      connectToNewUser(userId, stream);
    });

    document.addEventListener("keydown", (e) => {
      if (e.which === 13 && chatInputBox.value != "") {
        
        socket.emit("message",chatInputBox.value);
        chatInputBox.value = "";
      }
    });

    socket.on("createMessage", (msg,userName) => {
      console.log(msg);
      
      const today=new Date();
      const time=today.getHours()+":"+today.getMinutes();
      const li=document.createElement("li");
      li.innerHTML=`<div><b>${userName === user? "Me:" : userName+":"}</b><hr>${msg}<small id="sml">${time}</small></div>`;
      
      all_messages.append(li);
      main__chat__window.scrollTop = main__chat__window.scrollHeight;
    });
  });
  socket.on("user-disconnected",(userId)=>{
      if(peers[userId])peers[userId].close();
  })

peer.on("call", function (call) {
  getUserMedia(
    { video: true, audio: true },
    function (stream) {
      call.answer(stream); // Answer the call with an A/V stream.
      const video = document.createElement("video");
      call.on("stream", function (remoteStream) {
        addVideoStream(video, remoteStream);
      });
    },
    function (err) {
      console.log("Failed to get local stream", err);
    }
  );
});

peer.on("open", (id) => {
  socket.emit("join-room", ROOM_ID, id,user);
});

// CHAT

const connectToNewUser = (userId, streams) => {
  var call = peer.call(userId, streams);
  console.log(userId);
  var video = document.createElement("video");
  call.on("stream", (userVideoStream) => {
    console.log(userVideoStream);
    addVideoStream(video, userVideoStream);
  });
  call.on("close",()=>{
      video.remove();
  })
  peers[userId]=call;

};

const addVideoStream = (videoEl, stream) => {
  videoEl.srcObject = stream;
  videoEl.addEventListener("loadedmetadata", () => {
    videoEl.play();
  });
  myVideoStream.getVideoTracks()[0].enabled=false;
  myVideoStream.getAudioTracks()[0].enabled=false;
  videoGrid.append(videoEl);
  let totalUsers = document.getElementsByTagName("video").length;
  if (totalUsers > 1) {
    for (let index = 0; index < totalUsers; index++) {
      document.getElementsByTagName("video")[index].style.objectFit=fill;
    }
  }
  
};

const playStop = () => {
  let enabled = myVideoStream.getVideoTracks()[0].enabled;
  if (enabled) {
    myVideoStream.getVideoTracks()[0].enabled = false;
    setPlayVideo();
  } else {
    setStopVideo();
    myVideoStream.getVideoTracks()[0].enabled = true;
  }
};

const muteUnmute = () => {
  const enabled = myVideoStream.getAudioTracks()[0].enabled;
  if (enabled) {
    myVideoStream.getAudioTracks()[0].enabled = false;
    setUnmuteButton();
  } else {
    setMuteButton();
    myVideoStream.getAudioTracks()[0].enabled = true;
  }
};

const setPlayVideo = () => {
  const html = `<i class="unmute fas fa-play"></i>
  <span class="unmute">Resume Video</span>`;
  document.getElementById("playPauseVideo").innerHTML = html;
};

const setStopVideo = () => {
  const html = `<i class=" fas fa-stop"></i>
  <span class="">Stop Video</span>`;
  document.getElementById("playPauseVideo").innerHTML = html;
};

const setUnmuteButton = () => {
  const html = `<i class="unmute fas fa-microphone-alt-slash"></i>
  <span class="unmute">Unmute</span>`;
  document.getElementById("muteButton").innerHTML = html;
};
const setMuteButton = () => {
  const html = `<i class="fas fa-microphone-alt"></i>
  <span>Mute</span>`;
  document.getElementById("muteButton").innerHTML = html;
};

function ShowChat(e){
    e.classList.toggle("active");
    document.body.classList.toggle("showchat");
}



function getLink(){
    var modal=document.getElementById("Modal");
    console.log( modal.style.display)
   modal.style.display="block";
   document.getElementById("roomlnk").innerHTML=window.location.href;
   document.getElementById("roomlnk").style.display="block";
}

function CloseIt(){
    var modal=document.getElementById("Modal");
    modal.style.display="none";
}
function func(){
  var final= document.getElementById("final");
  final.style.display="flex";
  final.style.flexDirection="column";
}
//////////////////////////

(document.getElementById("name").innerHTML=user)
document.getElementById("lnk").innerHTML=window.location.href;

document.getElementById("call").onclick=function(){
  // document.getElementById("start-leave").style.visibility="hidden";
  // document.getElementById("start-leave").style.opacity="0";
  document.getElementById("start-leave").style.display="none";
  document.getElementById("main-left").style.flex="1";
  document.getElementById("main-left").style.display="flex";
  document.getElementById("main-right").style.flex="0.3";
}

document.getElementById("leave-meeting").onclick=function(){
  document.getElementById("start-leave").style.display="block";
 // document.getElementById("main-left").style.flex="1";
  document.getElementById("main-left").style.display="none";
  document.getElementById("main-right").style.flex="1";

  myVideoStream.getVideoTracks()[0].enabled = false;
    setPlayVideo();
  myVideoStream.getAudioTracks()[0].enabled = false;
    setUnmuteButton();
}


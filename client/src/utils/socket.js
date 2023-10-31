import io from "socket.io-client";
let Transporter = function () {
  let socket = io(window.location.href, {
    autoConnect: false,
  });
  let connected = false;
  let username;

  // function that adduser a new users
  let AddUser = (name, cb) => {
    username = name;
    if (username) {
      socket.emit("add user", username);
      cb();
    }
  };
  // listen for a login
  let login = (cb) => {
    socket.on("login", cb);
  };
  // when a user joins the chat room
  let AddParticipates = (cb) => {
    socket.on("user joined", cb);
  };
  let isTyping = () => {
    socket.emit("typing");
  };
  // listen to recording
  let isRecording = () => {
    socket.emit("recording");
  };
  let recorded = (cb) => {
    socket.on("recording", cb);
  };
  // listen to typing
  let typed = (cb) => {
    socket.on("typing", cb);
  };
  let AddMessage = (message, cb) => {
    socket.emit("message", message);
    cb();
  };
  // recieved messages sent by others
  let RecieveMessage = (cb) => {
    socket.on("message", cb);
  };
  //
  let EndChat = (cb) => {
    socket.emit("end");

    cb();
  };
  let joined = (cb) => {
    socket.on("user joined", cb);
  };

  let Left = (cb) => {
    socket.on("user left", cb);
  };
  let SendFile = (file, cb) => {
    socket.emit("File", file);
    cb();
  };
  let RecieveFile = (cb) => {
    socket.on("sent-file", cb);
  };

  return {
    AddUser,
    AddMessage,
    login,
    AddParticipates,
    RecieveMessage,
    isTyping,
    typed,
    joined,
    EndChat,
    Left,
    SendFile,
    RecieveFile,
    socket,
    isRecording,
    recorded,
  };
};
// let add the socket funcs
export default Transporter;

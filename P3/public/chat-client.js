//-- Elementos del interfaz
const display = document.getElementById("display");
const msg_entry = document.getElementById("msg_entry");
const msg_ = document.getElementById("msg_user");

let user = 'Desconocido';

let write = false;

//-- Crear un websocket. Se establece la conexión con el servidor
const socket = io();

socket.on("message", (msg)=>{
  display.innerHTML += '<p>' + msg + '</p>';
});

//-- Se envia un mensaje al servidor al pulsar el botón
msg_entry.onchange = () => {
  if (msg_entry.value)
  socket.send(user + ">> " + msg_entry.value);
  write = false;

  //-- Borrar el mensaje actual
  msg_entry.value = "";
}

//Si se escribe, se mandará un mensaje a los demás usuarios
msg_entry.oninput = () => {
    if(!write){
        write = true;
        socket.send(user + ' está escribiendo');
    };
};

console.log(user)

//Cuando se introduce nombre usuario
msg_user.onchange = () => {
    if(msg_user.value){
      user = msg_user.value;
    }
};
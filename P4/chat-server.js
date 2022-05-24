//-- Cargar las dependencias
const socket = require('socket.io');
const http = require('http');
const express = require('express');
const colors = require('colors');

const PUERTO = 9090;

let welcome_message = "¡Bienvenido al chat!";
let new_user = "Nuevo usuario conectado";
let desconected = 'Un usuario abandonó el chat';
let hello_message = "¡Hola!";
let date = new Date (Date.now());
var options = { year: 'numeric', month: 'long', day: 'numeric' };

let commands = "Comandos especiales: <br> " +
                "/help: Mostrará una lista con todos los comandos soportados <br>" + 
                "/list: Devolverá el número de usuarios conectados <br>" +
                "/hello: El servidor nos devolverá el saludo <br>" + 
                "/date: Nos devolverá la fecha <br>";

let user_count = 0;

//Crear nueva aplicacion web
const app = express();

//crear un servidor, asociado a la app express
const server = http.Server(app);

//Crear servidor websockets, asociado servidor http
const io = socket(server);

//ENTRADA DE LA APLICACION WEB
//Punto de entrada de aplicación web
app.get('/', (req, res) => {
  res.send('¡Bienvenido al chat!' + '<p><a href="/chat.html">Unirse al chat</a></p>');
});

//Necesario para que el servidor le envíe al cliente la biblioteca socket.io para el cliente
app.use('/', express.static(__dirname +'/'));

//Este directorio publico contiene ficheros estáticos
app.use(express.static('public'));

function comandos_especiales(msg){
    let data;
    if(msg == '/help'){
      console.log('Lista de comandos válidos');
      data = commands;
    }else if(msg == '/list'){
      console.log('Devuelve el número de usuarios conectados');
      data = "Hay " + user_count + " usuarios conectados en el chat";
    }else if(msg == '/hello'){
      console.log('El servidor devuelve el saludo');
      data = hello_message;
    }else if(msg == '/date'){
      console.log('Devuelve la fecha');
      data = "La fecha actual es: " + date.toLocaleDateString("es-ES", options);
    }else{
      console.log('Comando no valido');
      data = ("Comando no válido. Introduce /help para mostrar los comandos permitidos en el chat");
    };
    return(data);
  };
 
//GESTION SOCKETS IO
//Evento: Nueva conexion recibida
io.on('connect', (socket) => {

  console.log('** NUEVA CONEXIÓN **'.yellow);
  user_count = user_count + 1;

  //Mensaje bienvenida
  socket.send(welcome_message);

  //Mensaje al resto de usuarios de que hay un nuevo usuario en el chat
  io.send(new_user);

  //Evento desconexión
  socket.on('disconnect', function(){
    console.log('** CONEXIÓN TERMINADA **'.yellow);
    user_count -=1;

    io.send(desconected);
 });  

  //Mensaje recibido: Hacer eco
  socket.on("message", (msg)=> {
    console.log("Mensaje Recibido!: " + msg.blue);
    msg_text = msg.split(' ')[1];
    if(msg_text.startsWith('/')){
        console.log("Recurso recibido!: " + msg_text.red);
        data = comandos_especiales(msg_text);
        socket.send(data);
    }else{
        io.send(msg); 
    } 
  });
});

//Lanzamos servidor HTTP
server.listen(PUERTO);
console.log("Escuchando en puerto: " + PUERTO);
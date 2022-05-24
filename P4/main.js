//-- Cargar las dependencias
const socket = require('socket.io');
const http = require('http');
const express = require('express');
const colors = require('colors');
const electron = require('electron');
const ip = require('ip');
const process = require('process');

const PUERTO = 9090;

let win = null;

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

  //Envia los usuarios al renders
  win.webContents.send('users', user_count);

  //Mensaje bienvenida
  socket.send(welcome_message);

  //Mensaje al resto de usuarios de que hay un nuevo usuario en el chat
  io.send(new_user);

  //Se envia al render el mensaje de conexión
  win.webContents.send('msg_client', welcome_message);

  //Evento desconexión
  socket.on('disconnect', function(){
    console.log('** CONEXIÓN TERMINADA **'.yellow);
    user_count -=1;

    //Envia los usuarios al renders
    win.webContents.send('users', user_count);

    io.send(desconected);
 });  

  //Mensaje recibido: Hacer eco
  socket.on("message", (msg)=> {
    console.log("Mensaje Recibido!: " + msg.blue);

    //Envia los usuarios al renders
    win.webContents.send('msg_client', msg);

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

//Crea app electron
electron.app.on('ready', () => {
  console.log("Evento Ready!");

  //Crea ventana principal de la app
  win = new electron.BrowserWindow({
      width: 600,
      height: 600,  

      //Permitir que la ventana tenga ACCESO AL SISTEMA
      webPreferences: {
          nodeIntegration: true,
          contextIsolation: false
    }

  });

  //Carga la interfaz gráfica HTML
  let fichero = "index.html"
  win.loadFile(fichero);

  //Se obtiene informacion a enviar al renderizador
  //Se obtienen las versiones
  node_version = process.versions.node;
  chrome_version= process.versions.chrome;
  electron_version = process.versions.electron;

  //Obtiene arquitectura
  arquitectura = process.arch;
  //Obtiene plataforma
  plataforma = process.platform;
  //Obtiene directorio
  directorio = process.cwd();
  //Obtiene direccion IP
  dir_ip = ip.address();

  //Se reagrupan datos a enviar
  let datos = [node_version, chrome_version, electron_version, arquitectura, plataforma, directorio,
              dir_ip, PUERTO, fichero];

  //Esperar a que la página se cargue  con el evento 'ready-to-show'
  win.on('ready-to-show', () => {
      console.log("Enviando datos...");
      //send(nombre evento, mensaje)
      win.webContents.send('informacion', datos);
  });

});

//MENSAJES RECIBIDOS
//Esperar a recibir los mensajes de botón apretado (Mensaje prueba)
electron.ipcMain.handle('test', (event, msg) => {
  console.log("-> Mensaje: " + msg);
  //Se reenvian a todos los clientes conectados
  io.send(msg);
});
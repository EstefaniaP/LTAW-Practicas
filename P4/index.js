//PROCESO RENDERIZADO
const electron = require('electron');

//-- Obtener elementos de la interfaz
const version_node = document.getElementById("info1");
const version_chrome = document.getElementById("info2");
const version_electron = document.getElementById("info3");
const arquitectura = document.getElementById("info4");
const plataforma = document.getElementById("info5");
const directorio = document.getElementById("info6");
const num_usuarios = document.getElementById("users");
const dirIP = document.getElementById("ip");
const boton = document.getElementById("btn_test");
const mensajes = document.getElementById("display");


//-- Información del sistema
electron.ipcRenderer.on('informacion', (event, message) => {
    console.log("Recibido: " + message);

    //Se extraen los dato
    version_node.textContent = message[0];
    version_chrome.textContent = message[1];
    version_electron.textContent = message[2];
    arquitectura.textContent = message[3];
    plataforma.textContent = message[4];
    directorio.textContent = message[5]
    url = ("http://" + message[6] + ":" + message[7] + "/" + message[8]);
    dirIP.textContent = url;

});

//-- Numero de usuarios
electron.ipcRenderer.on('users', (event, message) => {
    console.log("Recibido: " + message);
    num_usuarios.textContent = message;
});

//-- Mensajes de clientes
electron.ipcRenderer.on('msg_client', (event, message) => {
    console.log("Recibido: " + message);
    mensajes.innerHTML += message + "<br>";
});

//Mensajes enviados al proceso MAIN
boton.onclick = () => {
    console.log("Botón apretado!");

    //-- Envia mensaje al proceso principal
    electron.ipcRenderer.invoke('test', "MENSAJE DE PRUEBA: Ole ole los caracoles");
};  

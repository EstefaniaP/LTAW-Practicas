//Importación módulos
const url = require('url');
const http = require('http');
const fs = require('fs');

const PUERTO = 9090;

//Creación servidor
const server = http.createServer((req, res) => {

    console.log("Petición recibida")

    const url = new URL(req.url, 'http://' + req.headers['host']);
    console.log(url.pathname);

    var resource = "";
    
    if (url.pathname == '/') {
      resource += "/tienda.html"; //Solita página principal
    } else {
      resource += url.pathname; //Otro recurso
    }

    //Obtención del recurso solicitado
    resource_type = resource.split(".")[1];
    resource = "." + resource;

    console.log("Recurso: " + resource);
    console.log("Extensión: " + resource_type);

    //Lectura asíncrona
    fs.readFile(resource, function(err, data){

      //Definición del tipo de archivo html.
      var mime = "text/html"

      //Definición del tipo de imágenes
      if(resource_type == 'jpg' || resource_type == 'png' || resource_type == 'PNG' || resource_type == 'gif'){
          mime = "image/" + resource_type;
      }

      //Definición del tipo de archivo css
      if (resource_type == "css"){
          mime = "text/css";
      }

      //Fichero no encontrado
      if (err) {
        resource = "./error.html";
        data = fs.readFileSync(resource);
        res.writeHead(404, {'Content-Type': mime});
        console.log("404 Not Found");
        res.write(data);
        res.end();
      }else{
          res.writeHead(200, {'Content-Type': mime});
          console.log("Peticion Recibida, 200 OK");
          res.write(data);
          res.end();
      }
    });
});

server.listen(PUERTO);
console.log("Servidor de la tienda online escuchando en puerto: " + PUERTO)
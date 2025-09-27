import fs from "fs";
import swaggerJSDoc from "swagger-jsdoc";

// Configuración de OpenAPI
const swaggerSpec = swaggerJSDoc({
  definition: {
    openapi: "3.0.3",
    info: { 
      title: "Inventory API", 
      version: "1.0.0",
      description: "API de inventario con endpoints CRUD"
    },
    servers: [{ url: "http://localhost:5000" }]
  },
  apis: ["./server.js"] // busca las anotaciones @swagger en server.js
});

// Guardar como openapi.json
fs.writeFileSync("openapi.json", JSON.stringify(swaggerSpec, null, 2), "utf8");

console.log("Archivo openapi.json generado en /api");


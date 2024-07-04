import categorias from "./categorias.js";
import precios from "./precios.js";
import db from "../config/db.js";
import { Categoria, Precio, Usuario } from '../models/index.js'
import usuarios from "./usuarios.js";

const importarDatos = async () => {
    try {
        // Autenticacion
        await db.authenticate()
        // Generar las columnas
        await db.sync()
        // Insertar los datos
        await Promise.all([Categoria.bulkCreate(categorias),
        Precio.bulkCreate(precios),
        Usuario.bulkCreate(usuarios)
        ])

        console.log('Datos importados correctamente')
        process.exit()
    } catch (error) {
        console.error(error)
        process.exit(1)
    }
}

const eliminarDatos = async () => {
    try {
        await db.sync({ force: true })
        console.log('Datos Eliminados Correctamente');
        process.exit()
    } catch (error) {
        console.log(error)
        process.exit(1)
    }
}

if (process.argv[2] === "-i") {
    importarDatos();
}

if (process.argv[2] === "-e") {
    eliminarDatos();
}

import express from 'express'
import { body } from 'express-validator';
import { admin, crear, guardar, agregarImagen,almacenarImagen, editar, guardarCambios, eliminar, mostrarPropiedad, enviarMensaje, verMensajes, cambiarEstado } from '../controllers/propiedadesController.js'
import protegerRuta from '../middleware/protegerRuta.js';
import upload from '../middleware/subirImagen.js'
import identificarUsuario from '../middleware/identificarUsuario.js';

const router = express.Router()

router.get('/mis-propiedades', protegerRuta, admin)
router.get('/propiedades/crear', protegerRuta, crear)
router.post('/propiedades/crear', 
    protegerRuta, 
    body('titulo').notEmpty().withMessage('El Titulo del anuncio es obligatorio'),
    body('descripcion').notEmpty().withMessage('La Descripcion no puede ir vacia')
    .isLength({ max: 200 }).withMessage('La Descripcion es muy larga'),
    body('categoria').isNumeric().withMessage('Selecciona una Categoria'),
    body('precio').isNumeric().withMessage('Selecciona un rango de precio'),
    body('habitaciones').isNumeric().withMessage('Selecciona la cantidad de habitaciones'),
    body('estacionamiento').isNumeric().withMessage('Selecciona la cantidad de estacionamientos'),
    body('wc').isNumeric().withMessage('Selecciona la cantidad de baños'),
    body('lat').notEmpty().withMessage('Selecciona una ubicacion en el mapa'),
    guardar)

router.get('/propiedades/agregar-imagen/:id', protegerRuta, agregarImagen)

router.post('/propiedades/agregar-imagen/:id', protegerRuta, upload.single('imagen'), almacenarImagen)

router.get('/propiedades/editar/:id', 
    protegerRuta,
    editar
)

router.post('/propiedades/editar/:id', 
    protegerRuta, 
    body('titulo').notEmpty().withMessage('El Titulo del anuncio es obligatorio'),
    body('descripcion').notEmpty().withMessage('La Descripcion no puede ir vacia')
    .isLength({ max: 200 }).withMessage('La Descripcion es muy larga'),
    body('categoria').isNumeric().withMessage('Selecciona una Categoria'),
    body('precio').isNumeric().withMessage('Selecciona un rango de precio'),
    body('habitaciones').isNumeric().withMessage('Selecciona la cantidad de habitaciones'),
    body('estacionamiento').isNumeric().withMessage('Selecciona la cantidad de estacionamientos'),
    body('wc').isNumeric().withMessage('Selecciona la cantidad de baños'),
    body('lat').notEmpty().withMessage('Selecciona una ubicacion en el mapa'),
    guardarCambios)

router.post('/propiedades/eliminar/:id', protegerRuta, eliminar)

// Area Publica
router.get('/propiedad/:id',
    identificarUsuario,
    mostrarPropiedad
)

// Guardar mensajes
router.post('/propiedad/:id',
    identificarUsuario,
    body('mensaje').isLength({min: 10}).withMessage('El mensaje no puede ir vacio o es my corto'),
    enviarMensaje
)

router.get('/mensajes/:id',
    protegerRuta,
    verMensajes
)

router.put('/propiedades/:id',
    protegerRuta,
    cambiarEstado
)

export default router
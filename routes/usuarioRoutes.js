import express from 'express'
import { formularioLogin, formularioOlvidePassword, formularioRegistro,  registrar, confirmar, resetPassword, comprobarToken, nuevoToken, autenticar, cerrarSesion } from '../controllers/usuarioController.js';

const router = express.Router()

router.get('/login', formularioLogin)
router.post('/login', autenticar)
router.get('/registro', formularioRegistro)
router.post('/registro', registrar)

router.post('/cerrar-sesion', cerrarSesion)

router.get('/confirmar/:token', confirmar)

router.get('/olvide-password', formularioOlvidePassword)
router.post('/olvide-password', resetPassword)

// Almacenar nuevo password
router.get('/olvide-password/:token', comprobarToken)
router.post('/olvide-password/:token', nuevoToken)

export default router
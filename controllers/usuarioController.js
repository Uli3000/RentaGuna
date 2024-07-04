import { check, validationResult } from 'express-validator'
import bcrypt from 'bcrypt'
import Usuario from '../models/Usuario.js'
import { generarJWT, generarId } from '../helpers/tokens.js'
import { emailRegistro, emailOlvidePassword } from '../helpers/emails.js'

const formularioLogin = (req, res) => res.render('auth/login', {
    pagina: 'Iniciar Sesion',
    csrfToken: req.csrfToken()
})

const autenticar = async (req, res) => {
    // Validacion
    await check('email').isEmail().withMessage('Tienes que ingresar un Email').run(req)
    await check('password').notEmpty().withMessage('La Contraseña es Obligatoria').run(req)

    let reesultado = validationResult(req)

    // Verificar que el resultado este vacio para mandar error
    if (!reesultado.isEmpty()) {
        return res.render('auth/login', {
            pagina: 'Iniciar Sesion',
            csrfToken: req.csrfToken(),
            errores: reesultado.array(),
        })
    }

    const { email, password } = req.body
    // Comprobar si el usuario existe
    const usuario = await Usuario.findOne({ where: { email } })
    if (!usuario) {
        return res.render('auth/login', {
            pagina: 'Iniciar Sesion',
            csrfToken: req.csrfToken(),
            errores: [{ msg: 'El Usuario no existe' }],
        })
    }

    // Comprobar si el usuario esta confirmado
    if (!usuario.confirmado) {
        return res.render('auth/login', {
            pagina: 'Iniciar Sesion',
            csrfToken: req.csrfToken(),
            errores: [{ msg: 'Tu cuenta no ha sido confirmada' }],
        })
    }

    // Confirmar el Password
    if(!usuario.verificarPassword(password)){
        return res.render('auth/login', {
            pagina: 'Iniciar Sesion',
            csrfToken: req.csrfToken(),
            errores: [{ msg: 'La contraseña es incorrecta' }],
        })
    }

    // Autentificazion del usuario
    const token = generarJWT({id: usuario.id, nombre: usuario.nombre})

    // Almacenar en un cookie

    return res.cookie('_token', token, {
        httpOnly: true, // Clave para que no lean los cookies con algun script
        // secure: true,
        // sameSize: true
    }).redirect('/mis-propiedades')
}

const formularioRegistro = (req, res) => res.render('auth/registro', {
    pagina: 'Crear Cuenta',
    csrfToken: req.csrfToken()
})

const formularioOlvidePassword = (req, res) => res.render('auth/olvide-password', {
    pagina: 'Recupera tu acceso a RentaGuna',
    csrfToken: req.csrfToken()
})

const registrar = async (req, res) => {
    // Validaciones
    await check('nombre').notEmpty().withMessage('El nombre no puede estar vacio').run(req)
    await check('email').isEmail().withMessage('Tienes que ingresar un Email').run(req)
    await check('password').isLength({ min: 6 }).withMessage('La contraseña debe ser de al menos 6 caracteres').run(req)
    await check('repetir_password').equals(req.body.password).withMessage('Los contraseñas no son iguales').run(req);

    let reesultado = validationResult(req)

    // Verificar que el resultado este vacio para mandar error
    if (!reesultado.isEmpty()) {
        return res.render('auth/registro', {
            pagina: 'Crear Cuenta',
            csrfToken: req.csrfToken(),
            errores: reesultado.array(),
            usuario: {
                nombre: req.body.nombre,
                email: req.body.email
            }
        })
    }

    // Extraer datos
    const { nombre, email, password } = req.body

    // Verificar repeticion de usuario
    const existeUsuario = await Usuario.findOne({ where: { email } })
    if (existeUsuario) {
        return res.render('auth/registro', {
            pagina: 'Crear Cuenta',
            csrfToken: req.csrfToken(),
            errores: [{ msg: 'El Usuario ya esta registrado' }],
            usuario: {
                nombre: req.body.nombre,
                email: req.body.email
            }
        })
    }

    // Guardar un usuario
    const usuario = await Usuario.create({
        nombre,
        email,
        password,
        token: generarId()
    })

    // Envia email de confirmacion
    emailRegistro({
        nombre: usuario.nombre,
        email: usuario.email,
        token: usuario.token
    })

    // Mensaje de confirmacion de cuenta
    res.render('templates/mensaje', {
        pagina: 'Cuenta Creada Correctamente',
        mensaje: 'Hemos enviado un mensaje de confirmacion, continuo en el enlace'
    })
}

// Comprobar cuenta
const confirmar = async (req, res) => {
    const { token } = req.params

    // Verificar si el token es valido
    const usuario = await Usuario.findOne({ where: { token } })

    if (!usuario) {
        return res.render('auth/confirmar-cuenta', {
            pagina: 'Error al confirmar tu cuenta',
            mensaje: 'Hubo un error al confirmar tu cuenta, intenta de nuevo',
            error: true
        }
        )
    }

    // Confirmar la cuenta
    usuario.token = null;
    usuario.confirmado = true;
    await usuario.save();

    res.render('auth/confirmar-cuenta', {
        pagina: 'Cuenta Confirmada',
        mensaje: 'La cuenta se confirmo correctamente'
    }
    )

}

const resetPassword = async (req, res) => {
    await check('email').isEmail().withMessage('Tienes que ingresar un Email').run(req)

    let reesultado = validationResult(req)

    // Verificar que el resultado este vacio para mandar error
    if (!reesultado.isEmpty()) {
        return res.render('auth/olvide-password', {
            pagina: 'Recupera tu acceso a RentaGuna',
            csrfToken: req.csrfToken(),
            errores: reesultado.array()
        })
    }

    // Buscar el usuario

    const { email } = req.body

    const usuario = await Usuario.findOne({ where: { email } })

    if (!usuario) {
        return res.render('auth/olvide-password', {
            pagina: 'Recupera tu acceso a RentaGuna',
            csrfToken: req.csrfToken(),
            errores: [{ msg: 'El Email no pertenece a ninguno de nuestros usuarios' }]
        })
    }

    // Generar un token y enviar el email de cambio de contraseña
    usuario.token = generarId();
    await usuario.save();

    // Enviar el email
    emailOlvidePassword({
        email: usuario.email,
        nombre: usuario.nombre,
        token: usuario.token
    })

    res.render('templates/mensaje', {
        pagina: 'Cambia tu contraseña',
        mensaje: 'Hemos enviado un email con las instrucciones'
    })
}

const comprobarToken = async (req, res) => {
    const { token } = req.params

    const usuario = await Usuario.findOne({ where: { token } })
    if (!usuario) {
        return res.render('auth/confirmar-cuenta', {
            pagina: 'Restablece tu contraseña',
            mensaje: 'Hubo un error al validar tu informacion, intenta de nuevo',
            error: true
        })
    }

    // Formulario para modificar la contraseña
    res.render('auth/reset-password', {
        pagina: 'Restablece tu contraseña',
        csrfToken: req.csrfToken()
    })

}

const nuevoToken = async (req, res) => {
    // Validar la contraseña
    await check('password').isLength({ min: 6 }).withMessage('El Password debe ser de al menos 6 caracteres').run(req)

    let reesultado = validationResult(req)

    // Verificar que el resultado este vacio para mandar error
    if (!reesultado.isEmpty()) {
        return res.render('auth/reset-password', {
            pagina: 'Cambia tu Contraseña',
            csrfToken: req.csrfToken(),
            errores: reesultado.array(),
        })
    }

    const { token } = req.params
    const { password } = req.body

    // Identificar quien hace el cambio
    const usuario = await Usuario.findOne({ where: { token } })

    // Hashear el nuevo password
    const salt = await bcrypt.genSalt(10);
    usuario.password = await bcrypt.hash(password, salt);
    usuario.token = null;

    await usuario.save();

    res.render('auth/confirmar-cuenta', {
        pagina: 'Contraseña Reestablecida',
        mensaje: 'La contraseña se cambio correctamente'
    })
}

const cerrarSesion = (req, res) => {
    return res.clearCookie('_token').status(200).redirect('/auth/login')
}

export {
    formularioLogin,
    formularioRegistro,
    formularioOlvidePassword,
    registrar,
    confirmar,
    resetPassword,
    comprobarToken,
    nuevoToken,
    autenticar,
    cerrarSesion
}
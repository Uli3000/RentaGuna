import jwt from 'jsonwebtoken'
import Usuario from '../models/Usuario.js'

const identificarUsuario = async (req, res, next) => {
    // Verificar si hay un token
    const token = req.cookies._token
    
    if(!token){
        req.usuario = null
        return next()
    }

    // Comprobar el token
    try {
        const decoded = jwt.verify(token,process.env.JWT_SECRET)
        const usuario = await Usuario.scope('eliminarPassword').findByPk(decoded.id)

        if(usuario){
            req.usuario = usuario
        }

        return next();
    } catch (error) {
        console.error(error)
        return res.clearCookie('_token').redirect('/auth/token')
    }
}

export default identificarUsuario
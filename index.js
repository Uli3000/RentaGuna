import express from 'express'
import csrf from 'csurf'
import cookieParser from 'cookie-parser'
import usuarioRoutes from './routes/usuarioRoutes.js'
import propiedadesRoutes from './routes/propiedadesRoutes.js'
import appRoutes from './routes/appRoutes.js'
import apiRoutes from './routes/apiRoutes.js'
import db from './config/db.js'

const app = express()

// Lectura de formulario
app.use(express.urlencoded({ extended: true }))

// Habilitar Cookie Parser
app.use(cookieParser())

// Habilitar CSRF
app.use(csrf({cookie: true}))

// Conexion db
try {
    await db.authenticate();
    db.sync();
    console.log("Conexion correcta a la Base de Datos")
} catch (error) {
    console.error(error)
}

// Pug
app.set('view engine', 'pug')
app.set('views', './views')

// Archivos Publicos
app.use(express.static('public'))

// Routing
app.use('/', appRoutes)
app.use('/auth', usuarioRoutes)
app.use('/', propiedadesRoutes)
app.use('/api', apiRoutes)


const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Server running on http://localhost:${port}`))
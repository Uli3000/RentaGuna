import { unlink } from 'node:fs/promises'
import { validationResult } from 'express-validator';
import { Precio, Categoria, Propiedad, Mensaje, Usuario } from '../models/index.js'
import { esVendedor, formatearFecha } from '../helpers/index.js';

const admin = async (req, res) => {

    // Leer QueryString
    const { pagina: paginaActual } = req.query

    const regEx = /^[0-9]$/

    if(!regEx.test(paginaActual)){
        return res.redirect('/mis-propiedades?pagina=1')
    }

    try {
        const { id } = req.usuario

        // Limites y Offset para el paginador
        const limit = 5;
        const offset = ((paginaActual * limit) - limit)

    const [propiedades, total] = await Promise.all([
        Propiedad.findAll({
            limit,
            offset,
            where: {
                usuarioId: id
            },
            include:[
                { model: Categoria, as: 'categoria' },
                { model: Precio, as: 'precio' },
                { model: Mensaje, as: 'mensajes' }
            ]
        }),
        Propiedad.count({
            where:{
                usuarioId: id
            }
        })
    ])

    res.render('propiedades/admin', {
        pagina: 'Mis Propiedades',
        csrfToken: req.csrfToken(),
        propiedades,
        paginas: Math.ceil(total / limit),
        paginaActual: Number(paginaActual),
        total,
        offset,
        limit
    })
    } catch (error) {
        console.error(error)
    }
    
}

const crear = async (req, res) => {
    // Consultar datos de precios y categorias
    const [categorias, precios] = await Promise.all([
        Categoria.findAll(),
        Precio.findAll()
    ])
    res.render('propiedades/crear', {
        pagina: 'Crear Propiedades',
        csrfToken: req.csrfToken(),
        categorias,
        precios,
        datos: {}
    })
}

const guardar = async (req, res) => {
    // Validacion
    let resultado = validationResult(req)

    if(!resultado.isEmpty()){
        const [categorias, precios] = await Promise.all([
            Categoria.findAll(),
            Precio.findAll()
        ])
        res.render('propiedades/crear', {
            pagina: 'Crear Propiedades',
            csrfToken: req.csrfToken(),
            categorias,
            precios,
            errores: resultado.array(),
            datos: req.body
        })
    }

    // Crear Registro
    const { titulo, descripcion, habitaciones, estacionamiento, wc, calle, lat, lng, precio, categoria } = req.body

    const { id: usuarioId } = req.usuario

    try{
        const propiedadGuardad = await Propiedad.create({
            titulo,
            descripcion,
            habitaciones,
            estacionamiento,
            wc,
            calle,
            lat,
            lng,
            precioId: precio,
            categoriaId: categoria,
            usuarioId,
            imagen: ''
        })

        const { id } = propiedadGuardad

        res.redirect(`/propiedades/agregar-imagen/${id}`)

    }catch(error){
        console.error(error)
    }
}

const agregarImagen = async (req, res) => {
    const { id } = req.params

    // Validaciones
    const propiedad = await Propiedad.findByPk(id)
    // Existe o no
    if(!propiedad){
        return res.redirect('/mis-propiedades')
    }
    // Esta publicada o no
    if(propiedad.publicado){
        return res.redirect('/mis-propiedades')
    }

    // Propiedad acorde a quien la publica
    if( req.usuario.id.toString() !== propiedad.usuarioId.toString() ){
        return res.redirect('/mis-propiedades')
    }

    res.render('propiedades/agregar-imagen',{
        pagina: `Agregar Imagen a ${propiedad.titulo}`,
        propiedad,
        csrfToken: req.csrfToken()
    })
}

const almacenarImagen = async (req, res, next) => {
    const { id } = req.params

    // Validaciones
    const propiedad = await Propiedad.findByPk(id)
    // Existe o no
    if(!propiedad){
        return res.redirect('/mis-propiedades')
    }
    // Esta publicada o no
    if(propiedad.publicado){
        return res.redirect('/mis-propiedades')
    }

    // Propiedad acorde a quien la publica
    if( req.usuario.id.toString() !== propiedad.usuarioId.toString() ){
        return res.redirect('/mis-propiedades')
    }

    res.render('propiedades/agregar-imagen',{
        pagina: `Agregar Imagen a ${propiedad.titulo}`,
        propiedad,
        csrfToken: req.csrfToken()
    })

    try {
        
        // Almacenar la imagen y publicar la propiedad
        propiedad.imagen = req.file.filename
        propiedad.publicado = 1

        await propiedad.save()

        next()

    } catch (error) {
        console.error(error)
    }
}

const editar = async (req, res) => {
    const { id } = req.params

    // Validar que la propiedad exista
    const propiedad = await Propiedad.findByPk(id)

    if(!propiedad){
        return res.redirect('/mis-propiedades')
    }

    // Revisar que quien visita la URL es quien creo la propiedad
    if(propiedad.usuarioId.toString() !== req.usuario.id.toString()){
        return res.redirect('/mis-propiedades')
    }

     // Consultar datos de precios y categorias
     const [categorias, precios] = await Promise.all([
        Categoria.findAll(),
        Precio.findAll()
    ])
    res.render('propiedades/editar', {
        pagina: `Editar La Propiedad ${propiedad.titulo}`,
        csrfToken: req.csrfToken(),
        categorias,
        precios,
        datos: propiedad
    })
}

const guardarCambios = async(req, res) => {
    // Verificar la validacion
    let resultado = validationResult(req)

    if(!resultado.isEmpty()){
        const [categorias, precios] = await Promise.all([
            Categoria.findAll(),
            Precio.findAll()
        ])

        return res.render('propiedades/editar', {
            pagina: 'Editar Propiedad',
            csrfToken: req.csrfToken(),
            categorias,
            precios,
            errores: resultado.array(),
            datos: req.body
        })
    }

    const { id } = req.params

    // Validar que la propiedad exista
    const propiedad = await Propiedad.findByPk(id)

    if(!propiedad){
        return res.redirect('/mis-propiedades')
    }

    // Revisar que quien visita la URL es quien creo la propiedad
    if(propiedad.usuarioId.toString() !== req.usuario.id.toString()){
        return res.redirect('/mis-propiedades')
    }

    // Reescribir el objeto y actualizarlo
    try {
        const { titulo, descripcion, habitaciones, estacionamiento, wc, calle, lat, lng, precio, categoria } = req.body

        propiedad.set({
            titulo,
            descripcion,
            habitaciones,
            estacionamiento,
            wc,
            calle,
            lat,
            lng,
            precioId: precio,
            categoriaId: categoria
        })

        await propiedad.save();

        res.redirect('/mis-propiedades')

    } catch (error) {
        console.error(error)
    }
}

const eliminar = async (req, res) => {
    const { id } = req.params

    // Validar que la propiedad exista
    const propiedad = await Propiedad.findByPk(id)

    if(!propiedad){
        return res.redirect('/mis-propiedades')
    }

    // Revisar que quien visita la URL es quien creo la propiedad
    if(propiedad.usuarioId.toString() !== req.usuario.id.toString()){
        return res.redirect('/mis-propiedades')
    }

    // Eliminar la imagen
    await unlink(`public/uploads/${propiedad.imagen}`)

    console.log(`Se elmino la imagen ${propiedad.imagen}`)

    // Eliminar la propiedad
    await propiedad.destroy()
    res.redirect('/mis-propiedades')
}

const mostrarPropiedad = async (req, res) =>{
    const { id } = req.params
    // Verificar inicio de sesion
    const token = req.cookies._token
    
    // Comprobar que la propiedad exista
    const propiedad = await Propiedad.findByPk(id, {
        include: [
            { model: Precio, as: 'precio' },
            { model: Categoria, as: 'categoria' },
        ]
    })

    if(!propiedad || !propiedad.publicado){
        return res.render('404',{
            token
        })
    }

    res.render('propiedades/mostrar',{
        propiedad,
        token,
        pagina: propiedad.titulo,
        csrfToken: req.csrfToken(),
        usuario: req.usuario,
        esVendedor: esVendedor(req.usuario?.id, propiedad.usuarioId)
    })
}

const enviarMensaje = async (req, res) =>{
    const { id } = req.params
    
    // Comprobar que la propiedad exista
    const propiedad = await Propiedad.findByPk(id, {
        include: [
            { model: Precio, as: 'precio' },
            { model: Categoria, as: 'categoria' },
        ]
    })

    if(!propiedad){
        return res.render('/404')
    }

    // Errores
    let resultado = validationResult(req)

    if(!resultado.isEmpty()){
        return res.render('propiedades/mostrar', {
            propiedad,
            pagina: propiedad.titulo,
            csrfToken: req.csrfToken(),
            usuario: req.usuario,
            esVendedor: esVendedor(req.usuario?.id, propiedad.usuarioId),
            errores: resultado.array()
        })
    }

    const { mensaje } = req.body
    const { id: propiedadId } = req.params
    const { id: usuarioId } = req.usuario

    // Guardar el mensaje
    await Mensaje.create({
        mensaje,
        propiedadId,
        usuarioId
    })

    res.redirect('/')
}

const verMensajes = async (req, res) =>{
    const { id } = req.params

    // Validar que la propiedad exista
    const propiedad = await Propiedad.findByPk(id, {
        include:[
            { model: Mensaje, as: 'mensajes',
                include: [
                    { model: Usuario.scope('eliminarPassword'), as: 'usuario' },
                ]
             },
        ]
    })

    if(!propiedad){
        return res.redirect('/mis-propiedades')
    }

    // Revisar que quien visita la URL es quien creo la propiedad
    if(propiedad.usuarioId.toString() !== req.usuario.id.toString()){
        return res.redirect('/mis-propiedades')
    }

    res.render('propiedades/mensajes',{
        pagina: 'Mensajes',
        mensajes: propiedad.mensajes,
        formatearFecha
    })
}

const cambiarEstado = async (req, res) => {
    const { id } = req.params

    // Validar que la propiedad exista
    const propiedad = await Propiedad.findByPk(id)

    if(!propiedad){
        return res.redirect('/mis-propiedades')
    }

    // Revisar que quien visita la URL es quien creo la propiedad
    if(propiedad.usuarioId.toString() !== req.usuario.id.toString()){
        return res.redirect('/mis-propiedades')
    }

    // Actualizar el estado
    propiedad.publicado = !propiedad.publicado

    await propiedad.save()

    res.json({
        resultado: true
    })
}

export{
    admin,
    crear,
    guardar,
    agregarImagen,
    almacenarImagen,
    editar,
    guardarCambios,
    eliminar,
    mostrarPropiedad,
    enviarMensaje,
    verMensajes,
    cambiarEstado
}
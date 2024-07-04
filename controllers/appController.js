import { Precio, Categoria, Propiedad } from '../models/index.js'
import { Sequelize } from 'sequelize'

const inicio = async (req, res) => {
    const [ categorias, precios, casas, departamentos, quintas ] = await Promise.all([
        Categoria.findAll({raw: true}), // raw para que solo te saque el id y nombre
        Precio.findAll({raw: true}),
        Propiedad.findAll({
            limit: 3,
            where: {
                categoriaId: 1
            },
            include: [
                {
                    model: Precio,
                    as: 'precio'
                }
            ],
            order: [
                ['createdAt', 'DESC']
            ]
        }),
        Propiedad.findAll({
            limit: 3,
            where: {
                categoriaId: 2
            },
            include: [
                {
                    model: Precio,
                    as: 'precio'
                }
            ],
            order: [
                ['createdAt', 'DESC']
            ]
        }),
        Propiedad.findAll({
            limit: 3,
            where: {
                categoriaId: 4
            },
            include: [
                {
                    model: Precio,
                    as: 'precio'
                }
            ],
            order: [
                ['createdAt', 'DESC']
            ]
        })
    ])

    // Verificar inicio de sesion
    const token = req.cookies._token
    
    res.render('inicio',{
        pagina: 'Inicio',
        token,
        categorias,
        precios,
        casas,
        departamentos,
        quintas,
        csrfToken: req.csrfToken()
    })
}

const categoria = async (req, res) => {
    const { id } = req.params
     // Verificar inicio de sesion
     const token = req.cookies._token

    // Comprobar que la categoria exista
    const categoria = await Categoria.findByPk(id)
    if(!categoria){
        return res.render('404',{
            token
        })
    }

    // Obtener sus propiedades
    const propiedades = await Propiedad.findAll({
      where:{
        categoriaId : id
      },
      include: [
        {model: Precio, as: 'precio'}
      ]  
    })

    res.render('categoria', {
        pagina: `${categoria.nombre}s en Venta`,
        token,
        propiedades,
        csrfToken: req.csrfToken()
    })
}

const noEncontrado = (req, res) => {
    res.render('404', {
        pagina: 'Contenido No Encontrado',
        csrfToken: req.csrfToken()
    })
}

const buscador = async (req, res) => {
    const { termino } = req.body

    // Validar que termino no este vacio
    if(!termino.trim()) {
        return res.redirect('back')
    }

    // Consultar las propiedades
    const propiedades = await Propiedad.findAll({
        where: {
            titulo: {
                [Sequelize.Op.like] : '%' + termino + '%'
            }
        },
        include: [
            { model: Precio, as: 'precio'}
        ]
    })

    res.render('busqueda', {
        pagina: 'Resultados de la Búsqueda',
        token,
        propiedades, 
        csrfToken: req.csrfToken()
    })
}

export{
    inicio,
    categoria,
    noEncontrado,
    buscador
}
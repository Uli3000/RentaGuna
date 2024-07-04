(function () {
    const cambiarEstadoBotones = document.querySelectorAll('.cambiar-estado')
    const token = document.querySelector('meta[name="csrf-token"]').getAttribute('content')

    cambiarEstadoBotones.forEach(boton => {
        boton.addEventListener('click', cambiarEstadoPropiedad)
    })

    async function cambiarEstadoPropiedad(evt) {
        try {
            const { propiedadId: id } = evt.target.dataset

            const url = `/propiedades/${id}`

            const respuesta = await fetch(url, {
                method: 'PUT',
                headers: {
                    'CSRF-Token' : token
                }
            })

            const { resultado } = await respuesta.json()

            if(resultado){
                if(evt.target.classList.contains('bg-yellow-100')){
                    evt.target.classList.add('bg-green-100', 'text-green-800')
                    evt.target.classList.remove('bg-yellow-100', 'text-yellow-800')
                    evt.target.textContent = 'Publicado'
                }else{
                    evt.target.classList.add('bg-yellow-100', 'text-yellow-800')
                    evt.target.classList.remove('bg-green-100', 'text-green-800')
                    evt.target.textContent = 'No Publicado'
                }
            }

        } catch (error) {
            console.error(error)
        }
    }
})()
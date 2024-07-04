(function() {
    const lat = document.querySelector('#lat').value || 25.5351671;
    const lng = document.querySelector('#lng').value || -103.4348953;
    const mapa = L.map('mapa').setView([lat, lng ], 16);
    let marker;

    //Provider y Geocoder
    const geocodeService = L.esri.Geocoding.geocodeService();

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(mapa);

    // Pin
    marker = new L.marker([lat, lng],{
        draggable: true,
        autoPan: true,
    }).addTo(mapa);

    // Detectar movimiento del Pin
    marker.on('moveend', event =>{
        marker = event.target

        const posicion = marker.getLatLng();

        mapa.panTo(new L.LatLng(posicion.lat, posicion.lng));

        // Obtner informacion de las calles
        geocodeService.reverse().latlng(posicion, 13).run((error, resultado) => {
            //console.log(resultado)

            marker.bindPopup(resultado.address.LongLabel)

            // Llenar los campos
            document.querySelector('.calle').textContent = resultado?.address?.Address ?? '';
            document.querySelector('#calle').value = resultado?.address?.Address ?? '';
            document.querySelector('#lat').value = resultado?.latlng?.lat ?? '';
            document.querySelector('#lng').value = resultado?.latlng?.lng ?? '';
        })
    })

})()
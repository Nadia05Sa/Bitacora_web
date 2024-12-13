const apiBaseUrl = 'http://localhost:8080/v1/bitacoras';

// Mostrar mensajes
function showMessage(message, type) {
    const messageBox = document.getElementById('message');
    messageBox.className = type;
    messageBox.textContent = message;
    setTimeout(() => {
        messageBox.className = '';
        messageBox.textContent = '';
    }, 3000);
}

// Cargar lista de bitácoras
function cargarBitacoras() {
    fetch(apiBaseUrl)
        .then((response) => {
            if (!response.ok) {
                throw new Error('Error en la solicitud');
            }
            return response.json();
        })
        .then((data) => {
            const bitacoras = data.data;  // Asegúrate de que `data` esté correctamente definido en la respuesta
            console.log(bitacoras);  // Agrega esto para ver los datos que se están obteniendo
            const bitacoraList = document.getElementById('bitacoraList');
            bitacoraList.innerHTML = '';

            bitacoras.forEach((bitacora) => {
                const div = document.createElement('div');
                div.className = 'bitacora-item';

                // Si hay una imagen en base64, la mostramos
                let imgHtml = '';
                if (bitacora.foto) {
                    imgHtml = `<img src="data:image/jpeg;base64,${bitacora.foto}" alt="Imagen de la bitácora" class="bitacora-img"/>`;
                }

                div.innerHTML = `
                    <style>
                        body {
                            margin: 0;
                            padding: 0;
                            display: flex;
                            height: 100%;
                            flex-direction: column;
                            justify-content: flex-start;
                            align-items: center;
                            background: no-repeat center/cover url("../img/SalonCecadec.jpg");
                            font-family: 'Montserrat Alternates', sans-serif;
                            position: relative;
                            color: #333;
                        }
                        
                        .overlay {
                            position: absolute;
                            top: 0;
                            left: 0;
                            width: 100%;
                            height: 100%;
                            background-color: rgba(0, 0, 0, 0.5); /* Negro con 50% de opacidad */
                            z-index: 1; /* Se coloca detrás del contenido principal */
                        }
                    </style>
                    ${imgHtml}
                    <p><strong>Fecha:</strong> ${bitacora.fecha}</p>
                    <p><strong>Hora Entrada:</strong> ${bitacora.horaEntrada}</p>
                    <p><strong>Hora Salida:</strong> ${bitacora.horaSalida}</p>
                    <p><strong>Maestro:</strong> ${bitacora.maestro}</p>
                    <p><strong>Grado:</strong> ${bitacora.grado}</p>
                    <p><strong>Grupo:</strong> ${bitacora.grupo}</p>
                    <p><strong>Descripción:</strong> ${bitacora.descripcion}</p>
                    <div class="bitacora-actions">
                        <button onclick="eliminarBitacora(${bitacora.id})">Eliminar</button>
                    </div>
                `;
                bitacoraList.appendChild(div);
            });
        })
        .catch((error) => {
            console.error('Error al cargar las bitácoras:', error);
            showMessage('Error al cargar las bitácoras', 'error');
        });
}

// Eliminar bitácora
function eliminarBitacora(id) {
    fetch(`${apiBaseUrl}/${id}`, {
        method: 'DELETE',
    })
        .then((response) => {
            if (!response.ok) throw new Error('Error al eliminar la bitácora');
            showMessage('Bitácora eliminada con éxito', 'success');
            cargarBitacoras();  // Recargar la lista después de eliminar
        })
        .catch((error) => {
            showMessage(error.message, 'error');
        });
}

// Cargar bitácoras al inicio
cargarBitacoras();

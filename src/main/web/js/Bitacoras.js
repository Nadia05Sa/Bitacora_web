const apiBaseUrl = 'http://localhost:8080/v1/bitacoras';

// Mostrar mensajes
function showMessage(message, type) {
    const messageBox = document.getElementById('message');
    if (messageBox) {
        messageBox.className = type;
        messageBox.textContent = message;
        setTimeout(() => {
            messageBox.className = '';
            messageBox.textContent = '';
        }, 3000);
    }
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
            console.log(data); // Verificar la respuesta del servidor
            const bitacoras = data.data;
            if (!bitacoras || bitacoras.length === 0) {
                showMessage('No hay bitácoras disponibles', 'info');
                return;
            }

            const bitacoraList = document.getElementById('bitacoraList');
            if (!bitacoraList) return;

            bitacoraList.innerHTML = '';

            bitacoras.forEach((bitacora) => {
                const div = document.createElement('div');
                div.className = 'bitacora-item';

                // Verificar si la foto es una cadena base64
                let imgHtml = '';
                if (bitacora.foto) {
                    // Si la foto tiene un valor que empieza con "/9j", añadimos el prefijo
                    const imgSrc = bitacora.foto.startsWith('/9j') ? `data:image/jpeg;base64,${bitacora.foto}` : bitacora.foto;
                    imgHtml = `<img src="${imgSrc}" alt="Imagen de la bitácora" class="bitacora-img"/>`;
                }

                div.innerHTML = `
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

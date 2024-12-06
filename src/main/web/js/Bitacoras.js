const apiBaseUrl = 'http://localhost:8080/v1/bitacoras';  // Asegúrate de que esta URL es correcta

function showAlert(message, type) {
    const alert = document.getElementById('alert');
    alert.className = type === 'success' ? 'success' : 'error';
    alert.textContent = message;
    alert.style.display = 'block';
    setTimeout(() => {
        alert.style.display = 'none';
    }, 3000);
}

function cargarBitacoras() {
    fetch(apiBaseUrl)
        .then((response) => response.json())
        .then((data) => {
            const bitacoras = data.response.bitacora;  // Asegúrate de que `bitacora` está correctamente definido en la respuesta
            const bitacoraList = document.getElementById('bitacoraList');
            bitacoraList.innerHTML = '';

            bitacoras.forEach((bitacora) => {
                const div = document.createElement('div');
                div.className = 'equipo-item';
                div.innerHTML = `
                        <p><strong>Fecha:</strong> ${bitacora.fecha}</p>
                        <p><strong>Hora Entrada:</strong> ${bitacora.horaEntrada}</p>
                        <p><strong>Hora Salida:</strong> ${bitacora.horaSalida}</p>
                        <p><strong>Maestro:</strong> ${bitacora.maestro}</p>
                        <p><strong>Grado:</strong> ${bitacora.grado}</p>
                        <p><strong>Grupo:</strong> ${bitacora.grupo}</p>
                        <p><strong>Descripción:</strong> ${bitacora.descripcion}</p>
                        <div class="equipo-actions">
                            <button onclick="eliminarBitacora(${bitacora.id})">Eliminar</button>
                        </div>
                    `;
                bitacoraList.appendChild(div);
            });
        })
        .catch(() => showAlert('Error al cargar las bitácoras', 'error'));
}

function eliminarBitacora(id) {
    if (confirm('¿Estás seguro de eliminar esta bitácora?')) {
        fetch(`${apiBaseUrl}/${id}`, { method: 'DELETE' })
            .then((response) => {
                if (!response.ok) {
                    throw new Error('Error al eliminar la bitácora');
                }
                showAlert('Bitácora eliminada con éxito', 'success');
                cargarBitacoras();
            })
            .catch(() => showAlert('Error al eliminar la bitácora', 'error'));
    }
}

cargarBitacoras();
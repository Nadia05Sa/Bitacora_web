const apiBaseUrl = 'http://localhost:8080/v1/salones';

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

// Registrar un nuevo salón
document.getElementById('salonForm').addEventListener('submit', function (e) {
    e.preventDefault();

    const salon = {
        nombre: document.getElementById('nombre').value,
        ubicacion: document.getElementById('ubicacion').value,
        capacidad: document.getElementById('capacidad').value,
    };

    fetch(apiBaseUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(salon),
    })
        .then((response) => {
            if (!response.ok) throw new Error('Error al registrar el salón');
            return response.json();
        })
        .then(() => {
            showMessage('Salón registrado con éxito', 'success');
            document.getElementById('salonForm').reset();
            cargarSalones();
        })
        .catch((error) => showMessage(error.message, 'error'));
});

// Cargar lista de salones
function cargarSalones() {
    fetch(apiBaseUrl)
        .then((response) => {
            if (!response.ok) throw new Error('Error al cargar la lista de salones');
            return response.json();
        })
        .then((data) => {
            const salonesList = document.getElementById('salonesList');
            salonesList.innerHTML = '';
            data.forEach((salon) => {
                const div = document.createElement('div');
                div.className = 'salon-item';
                div.innerHTML = `
                        <div>
                            <strong>${salon.nombre}</strong>
                            <p>Ubicación: ${salon.ubicacion}</p>
                            <p>Capacidad: ${salon.capacidad}</p>
                            <div class="salon-actions">
                                <button onclick="eliminarSalon(${salon.id})">Eliminar</button>
                                <button onclick="editarSalon(${salon.id})">Editar</button>
                            </div>
                        </div>
                    `;
                salonesList.appendChild(div);
            });
        })
        .catch((error) => showMessage(error.message, 'error'));
}

// Eliminar un salón
function eliminarSalon(id) {
    fetch(`${apiBaseUrl}/${id}`, {
        method: 'DELETE',
    })
        .then((response) => {
            if (!response.ok) throw new Error('Error al eliminar el salón');
            showMessage('Salón eliminado con éxito', 'success');
            cargarSalones();
        })
        .catch((error) => showMessage(error.message, 'error'));
}

// Editar un salón
function editarSalon(id) {
    const salon = {
        nombre: prompt('Nombre:'),
        ubicacion: prompt('Ubicación:'),
        capacidad: prompt('Capacidad:'),
    };

    fetch(`${apiBaseUrl}/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(salon),
    })
        .then((response) => {
            if (!response.ok) throw new Error('Error al actualizar el salón');
            return response.json();
        })
        .then(() => {
            showMessage('Salón actualizado con éxito', 'success');
            cargarSalones();
        })
        .catch((error) => showMessage(error.message, 'error'));
}

// Cargar salones al inicio
cargarSalones();

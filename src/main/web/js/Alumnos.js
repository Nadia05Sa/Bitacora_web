const apiBaseUrl = 'http://localhost:8080/v1/alumnos'; // URL base del backend
const adminRole = true; // Asume que se determina desde el backend al iniciar sesión

// Mostrar mensajes de éxito o error
function showMessage(message, type) {
    const messageBox = document.getElementById('message');
    messageBox.className = type; // 'error' o 'success'
    messageBox.textContent = message;
    setTimeout(() => {
        messageBox.className = '';
        messageBox.textContent = '';
    }, 3000);
}

// Registrar un alumno
document.getElementById('alumnoForm').addEventListener('submit', function (e) {
    e.preventDefault();

    if (!adminRole) {
        showMessage('No tienes permisos para registrar alumnos', 'error');
        return;
    }

    const alumno = {
        nombre: document.getElementById('nombre').value.trim(),
        apellido: document.getElementById('apellido').value.trim(),
        matricula: document.getElementById('matricula').value.trim(),
        correo: document.getElementById('correo').value.trim(),
        contrasena: document.getElementById('contrasena').value.trim()
    };

    // Validar correo
    if (!/^\S+@\S+\.\S+$/.test(alumno.correo)) {
        showMessage('Correo inválido.', 'error');
        return;
    }

    fetch(apiBaseUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(alumno)
    })
        .then(response => response.json())
        .then(data => {
            if (data.codigo === 201) {
                showMessage(data.message, 'success');
                document.getElementById('alumnoForm').reset();
                cargarAlumnos();
            } else {
                throw new Error(data.message);
            }
        })
        .catch(error => showMessage(error.message, 'error'));
});

// Cargar lista de alumnos
function cargarAlumnos() {
    fetch(apiBaseUrl)
        .then(response => response.json())
        .then(data => {
            if (data.codigo === 200) {
                const alumnosList = document.getElementById('alumnosList');
                alumnosList.innerHTML = '';
                data.data.forEach(alumno => {
                    const div = document.createElement('div');
                    div.className = 'alumno-item';
                    div.innerHTML = `
                        <div>
                            <strong>${alumno.nombre} ${alumno.apellido}</strong>
                            <p>Matrícula: ${alumno.matricula}</p>
                            <p>Correo: ${alumno.correo}</p>
                            <div class="alumno-actions">
                                ${adminRole ? `<button class="edit-button" onclick="editarAlumno(${alumno.id})">Editar</button>` : ''}
                                ${adminRole ? `<button onclick="eliminarAlumno(${alumno.id})">Eliminar</button>` : ''}
                            </div>
                        </div>
                    `;
                    alumnosList.appendChild(div);
                });
            } else {
                throw new Error(data.message);
            }
        })
        .catch(error => showMessage(error.message, 'error'));
}

// Eliminar un alumno
function eliminarAlumno(id) {
    if (!adminRole) {
        showMessage('No tienes permisos para eliminar alumnos', 'error');
        return;
    }

    if (!confirm('¿Seguro que deseas eliminar este alumno?')) return;

    fetch(`${apiBaseUrl}/${id}`, { method: 'DELETE' })
        .then(response => {
            if (response.status === 204) {
                showMessage('Alumno eliminado con éxito.', 'success');
                cargarAlumnos();
            } else {
                return response.json().then(data => { throw new Error(data.message); });
            }
        })
        .catch(error => showMessage(error.message, 'error'));
}

// Editar un alumno usando SweetAlert2
function editarAlumno(id) {
    fetch(`${apiBaseUrl}/${id}`)
        .then(response => response.json())
        .then(data => {
            const alumno = data.data;
            Swal.fire({
                title: 'Editar Alumno',
                html: `
                    <label>Nombre:</label>
                    <input id="edit-nombre" class="swal2-input" value="${alumno.nombre}">
                    <label>Apellido:</label>
                    <input id="edit-apellido" class="swal2-input" value="${alumno.apellido}">
                    <label>Matrícula:</label>
                    <input id="edit-matricula" class="swal2-input" value="${alumno.matricula}">
                    <label>Correo:</label>
                    <input id="edit-correo" class="swal2-input" value="${alumno.correo}">
                `,
                focusConfirm: false,
                preConfirm: () => {
                    return {
                        nombre: document.getElementById('edit-nombre').value,
                        apellido: document.getElementById('edit-apellido').value,
                        matricula: document.getElementById('edit-matricula').value,
                        correo: document.getElementById('edit-correo').value
                    };
                }
            }).then(result => {
                if (result.isConfirmed) {
                    const alumno = result.value;
                    fetch(`${apiBaseUrl}/${id}`, {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(alumno)
                    })
                        .then(response => response.json())
                        .then(data => {
                            if (data.codigo === 200) {
                                showMessage(data.message, 'success');
                                cargarAlumnos();
                            } else {
                                throw new Error(data.message);
                            }
                        })
                        .catch(error => showMessage(error.message, 'error'));
                }
            });
        })
        .catch(error => showMessage(error.message, 'error'));
}

// Cargar alumnos al cargar la página
cargarAlumnos();

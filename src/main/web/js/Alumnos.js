const apiBaseUrl = 'http://localhost:8080/v1/alumnos'; // URL base del backend
let adminRole = true; // Este valor debe ser asignado según la sesión del usuario

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
document.getElementById('alumnoForm').addEventListener('submit', async function (e) {
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

    try {
        const response = await fetch(apiBaseUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(alumno)
        });
        const data = await response.json();
        if (data.codigo === 201) {
            showMessage(data.message, 'success');
            document.getElementById('alumnoForm').reset();
            cargarAlumnos();
        } else {
            throw new Error(data.message);
        }
    } catch (error) {
        showMessage(error.message, 'error');
    }
});

// Cargar lista de alumnos
async function cargarAlumnos() {
    try {
        const response = await fetch(apiBaseUrl);
        const data = await response.json();
        if (data.codigo === 200) {
            const alumnosList = document.getElementById('alumnosList');
            alumnosList.innerHTML = '';
            data.data.forEach(alumno => {
                const div = document.createElement('div');
                div.className = 'alumno-item';
                div.innerHTML = `
                        <style>
                             body {
                                height: 100%;
                            }
                            
                            .overlay {
                                height: 100%;
                            }
                        </style>
                    <div>
                        <strong>${alumno.nombre} ${alumno.apellido}</strong>
                        <p>Matrícula: ${alumno.matricula}</p>
                        <p>Correo: ${alumno.correo}</p>
                        <div class="alumno-actions">
                            ${adminRole ? `<button class="editar" class="edit-button" onclick="editarAlumno('${alumno.correo}')">Editar</button>` : ''}
                            ${adminRole ? `<button class="eliminar" onclick="eliminarAlumno('${alumno.correo}')">Eliminar</button>` : ''}
                        </div>
                    </div>
                `;
                alumnosList.appendChild(div);
            });
        } else {
            throw new Error(data.message);
        }
    } catch (error) {
        showMessage(error.message, 'error');
    }
}

// Eliminar un alumno
async function eliminarAlumno(correo) {
    if (!adminRole) {
        showMessage('No tienes permisos para eliminar alumnos', 'error');
        return;
    }

    if (!confirm('¿Seguro que deseas eliminar este alumno?')) return;

    try {
        const response = await fetch(`${apiBaseUrl}/${correo}`, { method: 'DELETE' });
        if (response.status === 204) {
            showMessage('Alumno eliminado con éxito.', 'success');
            cargarAlumnos();
        } else {
            const data = await response.json();
            throw new Error(data.message);
        }
    } catch (error) {
        showMessage(error.message, 'error');
    }
}

// Editar un alumno usando SweetAlert2
async function editarAlumno(correo) {
    try {
        const response = await fetch(`${apiBaseUrl}/${correo}`);
        const data = await response.json();
        const alumno = data.data;

        const result = await Swal.fire({
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
            preConfirm: () => ({
                nombre: document.getElementById('edit-nombre').value,
                apellido: document.getElementById('edit-apellido').value,
                matricula: document.getElementById('edit-matricula').value,
                correo: document.getElementById('edit-correo').value
            })
        });

        if (result.isConfirmed) {
            const alumnoData = result.value;
            const putResponse = await fetch(`${apiBaseUrl}/${correo}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(alumnoData)
            });
            const putData = await putResponse.json();
            if (putData.codigo === 200) {
                showMessage(putData.message, 'success');
                cargarAlumnos();
            } else {
                throw new Error(putData.message);
            }
        }
    } catch (error) {
        showMessage(error.message, 'error');
    }
}

// Cargar alumnos al cargar la página
cargarAlumnos();

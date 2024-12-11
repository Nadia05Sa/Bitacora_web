describe('Prueba de Edición de Alumno', () => {
    it('Debe editar un alumno correctamente y reflejar los cambios', () => {
        // ... (suponiendo que ya estamos en la página de gestión de alumnos)

        // Buscar el alumno a editar por su correo (ajusta el selector si es necesario)
        cy.contains('td', '20233tn069@utez.edu.mx')
            .parent() // Ir al elemento padre (la fila del alumno)
            .find('.edit-button')
            .click();

        // Llenar los campos del modal
        cy.get('#edit-nombre').clear().type('Nuevo Nombre');
        cy.get('#edit-apellido').clear().type('Nuevo Apellido');
        // ... (llenar otros campos según sea necesario)

        // Hacer clic en el botón "OK"
        cy.contains('button', 'OK').click();

        // Validar que los cambios se hayan guardado
        cy.contains('td', 'Nuevo Nombre')
            .should('exist'); // Asegurarse de que el nuevo nombre esté presente
        cy.contains('td', 'Nuevo Apellido')
            .should('exist');
    });
});
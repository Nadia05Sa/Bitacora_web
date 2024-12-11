describe('Prueba de Eliminación de Alumno', () => {
    it('Debe eliminar un alumno correctamente y no aparecer en la lista', () => {
        // ... (suponiendo que ya estamos en la página de gestión de alumnos)

        // Buscar el alumno a eliminar por su correo (ajusta el selector si es necesario)
        cy.contains('td', '20233tn069@utez.edu.mx')
            .parent() // Ir al elemento padre (la fila del alumno)
            .find('.delete-button') // Asumimos que el botón tiene la clase 'delete-button'
            .click();

        // Si aparece un modal de confirmación, confirma la eliminación
        cy.contains('button', 'Confirmar').click(); // Ajusta el texto del botón si es diferente

        // Esperar a que la lista se actualice (opcional)
        cy.wait(1000);

        // Validar que el alumno ya no esté en la lista
        cy.contains('td', '20233tn069@utez.edu.mx')
            .should('not.exist');
    });
});
describe('Prueba de Eliminación de Alumno', () => {
    it('Debe eliminar un alumno correctamente y no aparecer en la lista', () => {
        // Visitar la página inicial y realizar el login
        cy.visit('http://192.168.109.34:9090/src/main/web/Login.html');
        cy.get('#email').type('admin');
        cy.get('#password').type('admin1234');
        cy.get('#loginButton').click();

        // Navegar al menú y a la gestión de alumnos
        cy.get('div.btn-menu label[for="btn-menu"]').click();
        cy.contains('a', 'Gestión de Alumnos').click();

        // ... (resto de la prueba, como la tienes actualmente)

        // Buscar al alumno a eliminar por su matrícula
        cy.contains('p', 'Matrícula: 20233tn069')
            .parent() // Ir al elemento padre (el div que contiene la información del alumno)
            .find('.delete-button')
            .click();

        // Confirmar la eliminación
        cy.on('window:confirm', () => true); // Confirmar la alerta
        cy.contains('button', 'Eliminar').click(); // Hacer clic en el botón de eliminar

        // Esperar a que la lista se actualice
        cy.wait(2000);

        // Validar que el alumno ya no esté en la lista
        cy.contains('p', 'Matrícula: 20233tn069')
            .should('not.exist');
    });
});
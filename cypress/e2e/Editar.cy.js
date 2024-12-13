describe('Prueba de Edición de Alumno', () => {
    it('Debe editar un alumno correctamente y reflejar los cambios', () => {
        // Visitar la página inicial y realizar el login
        cy.visit('http://192.168.109.34:9090/src/main/web/Login.html');
        cy.get('#email').type('admin');
        cy.get('#password').type('admin1234');
        cy.get('#loginButton').click();

        // Navegar al menú y a la gestión de alumnos
        cy.get('div.btn-menu label[for="btn-menu"]').click();
        cy.contains('a', 'Gestión de Alumnos').click();

        // Buscar el alumno a editar por su matrícula
        cy.contains('p', 'Matrícula: 20233tn069')
            .parent() // Ir al elemento padre (el div que contiene la información del alumno)
            .find('.edit-button')
            .click();

        // Llenar los campos del modal
        cy.get('#edit-nombre').clear().type('Nuevo Nombre');
        cy.get('#edit-apellido').clear().type('Nuevo Apellido');
        // ... (llenar otros campos según sea necesario)

        // Hacer clic en el botón "OK"
        cy.contains('button', 'OK').click();

        // Validar que los cambios se hayan guardado
        cy.contains('strong', 'Nuevo Nombre')
            .should('exist'); // Asegurarse de que el nuevo nombre esté presente en el elemento <strong>
    });
});
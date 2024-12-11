describe('Prueba de Registro de Empleados', () => {
  it('Debe registrar un empleado correctamente y mostrarlo en la lista', () => {
    // Visitar la página inicial
    cy.visit('http://127.0.0.1:9090/src/main/web/Login.html');

    // Completar el inicio de sesión
    cy.get('#email').type('admin');
    cy.get('#password').type('admin1234');
    cy.get('#loginButton').click();

    // Navegar al menú
    cy.get('div.btn-menu label[for="btn-menu"]').click(); // Clic en el botón del menú

    // Seleccionar Gestión de Empleados
    cy.contains('a', 'Gestión de Empleados').click();

    // Validar que estamos en la página correcta
    cy.url().should('include', '/Tecnicos.html');
    cy.get('h1').should('contain', 'Gestión de Empleados');

    // Llenar el formulario de registro
    cy.get('#nombre').type('Julia');
    cy.get('#apellido').type('Ramirez');
    cy.get('#correo').type('julia.perez@example.com');
    cy.get('#contrasena').type('password123');
    cy.get('#tipo').select('Tecnico');

    // Hacer clic en el botón de registrar
    cy.get('form#empleadoForm button[type="submit"]').click();

    // Validar que el mensaje de éxito se muestra
    cy.get('#message')
        .should('be.visible') // El mensaje debe ser visible
        .and('contain', 'Técnico creado con éxito') // Contener el texto esperado
        .and('not.have.class', 'error'); // No tener clase de error

    // Esperar a que la lista se actualice
    cy.wait(1000); // Esto asegura que haya tiempo para que el DOM se actualice

    // Validar que el nuevo empleado aparece en la lista
    cy.get('#empleadosList').should('contain', 'Julia Ramirez');
  });
});

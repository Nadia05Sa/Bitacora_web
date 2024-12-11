describe('Prueba de Login', () => {
  it('Debe realizar el login correctamente y redirigir a la página de inicio', () => {
    // Visita la página de inicio de sesión
    cy.visit('http://192.168.111.112:9090/src/main/web/Login.html');

    // Completar los campos de correo y contraseña
    cy.get('#email').type('admin'); // Campo de correo
    cy.get('#password').type('admin1234'); // Campo de contraseña

    // Hacer clic en el botón de acceso
    cy.get('#loginButton').click();

    // Validar que la URL cambió a la página de inicio después del login exitoso
    cy.url().should('include', '/Inicio.html'); // Ajustado para la URL real

    // Validar el contenido del encabezado dentro del div
    cy.get('.containerr.main-content h1').should('contain', 'Bienvenido');

    // Opcional: Validar también el párrafo si es relevante
    cy.get('.containerr.main-content p').should('contain', 'Seleccione una opción en el menú para comenzar.');
  });
});

// Clave secreta simulada para decodificar (en producción, no se incluye en el frontend)
const JWT_SECRET_KEY = "losmerosmerosoa4eee";

// Simula la generación de un token en el backend
function generateToken(email, role) {
    const header = { alg: "HS256", typ: "JWT" };
    const payload = {
        email: email,
        rol: { authority: role },
        exp: Math.floor(Date.now() / 1000) + 60 * 60 // Expira en 1 hora
    };
    const token = btoa(JSON.stringify(header)) + '.' + btoa(JSON.stringify(payload)) + '.signature';
    return token;
}

// Simula la decodificación de un token
function decodeJWT(token) {
    try {
        const payload = token.split('.')[1];
        return JSON.parse(atob(payload));
    } catch (error) {
        console.error("Error al decodificar el token:", error);
        return null;
    }
}

// Verifica si el token ha expirado
function isTokenExpired(exp) {
    const expirationTime = exp * 1000; // Convertir segundos a milisegundos
    return Date.now() > expirationTime;
}

// Validar el acceso según el token
function validateAccess(allowedRoles) {
    const token = sessionStorage.getItem("token");
    if (!token) {
        alert("Debes iniciar sesión primero.");
        window.location.href = "login.html";
        return;
    }

    const decodedToken = decodeJWT(token);
    if (!decodedToken) {
        alert("Token inválido. Por favor, inicia sesión nuevamente.");
        sessionStorage.clear();
        window.location.href = "login.html";
        return;
    }

    if (isTokenExpired(decodedToken.exp)) {
        alert("Sesión expirada. Por favor, inicia sesión nuevamente.");
        sessionStorage.clear();
        window.location.href = "login.html";
        return;
    }

    const userRole = decodedToken.rol?.authority;
    if (!allowedRoles.includes(userRole)) {
        alert("No tienes permisos para acceder a esta página.");
        sessionStorage.clear();
        window.location.href = "login.html";
    }
}

// Evento para simular el login
document.getElementById("loginButton").addEventListener("click", function () {
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    if (email && password) {
        // Simula la autenticación y generación de token
        const token = generateToken(email, "Admin"); // Cambiar "Admin" según el rol deseado
        sessionStorage.setItem("token", token);
        alert("Inicio de sesión exitoso. Redirigiendo...");
        window.location.href = "Inicio.html"; // Cambia a la página protegida
    } else {
        alert("Por favor, llena todos los campos.");
    }
});

// Llama a la validación en la página protegida
// validateAccess(["Admin", "Empleado"]); // Descomentar en la página protegida
class AuthManager {
    // Predefined admin credentials
    static ADMIN_EMAIL = "admin";
    static ADMIN_PASSWORD = "admin1234";

    // Use a more secure way to generate tokens (this is still a simulation)
    static generateToken(email, role) {
        const payload = {
            sub: email,  // Subject (user identifier)
            role: role,
            iat: Math.floor(Date.now() / 1000),  // Issued at
            exp: Math.floor(Date.now() / 1000) + (60 * 60), // 1 hour expiration
            jti: crypto.randomUUID() // Unique token identifier
        };

        // In a real-world scenario, this would be a server-side JWT signing process
        return this.mockTokenGeneration(payload);
    }

    // Simulated token generation (replace with actual JWT library in production)
    static mockTokenGeneration(payload) {
        const header = { alg: "HS256", typ: "JWT" };
        return `${btoa(JSON.stringify(header))}.${btoa(JSON.stringify(payload))}.signature`;
    }

    // Improved token decoding with more robust error handling
    static decodeToken(token) {
        try {
            if (!token) throw new Error("No token provided");

            const [, payloadBase64] = token.split('.');
            const payload = JSON.parse(atob(payloadBase64));

            return {
                email: payload.sub,
                role: payload.role,
                expiresAt: payload.exp
            };
        } catch (error) {
            console.error("Token decoding error:", error.message);
            return null;
        }
    }

    // Enhanced token validation
    static validateToken() {
        const token = sessionStorage.getItem("token");
        if (!token) {
            this.redirectToLogin("Debes iniciar sesión");
            return false;
        }

        const decodedToken = this.decodeToken(token);
        if (!decodedToken) {
            this.redirectToLogin("Token inválido");
            return false;
        }

        if (this.isTokenExpired(decodedToken.expiresAt)) {
            this.redirectToLogin("Sesión expirada");
            return false;
        }

        return decodedToken;
    }

    // Check if token is expired
    static isTokenExpired(expirationTime) {
        return Date.now() / 1000 > expirationTime;
    }

    // Centralized login handling - NOW ONLY FOR ADMIN
    static login(email, password) {
        // Strict admin-only authentication
        if (email !== this.ADMIN_EMAIL || password !== this.ADMIN_PASSWORD) {
            alert("Acceso denegado. Solo administradores pueden iniciar sesión.");
            return false;
        }

        // Generate token specifically for admin
        const token = this.generateToken(email, "Admin");
        sessionStorage.setItem("token", token);
        return true;
    }

    // Centralized logout method
    static logout() {
        sessionStorage.removeItem("token");
        this.redirectToLogin("Sesión cerrada");
    }

    // Role-based access control
    static checkAccess(allowedRoles) {
        const decodedToken = this.validateToken();
        if (!decodedToken) return false;

        if (!allowedRoles.includes(decodedToken.role)) {
            this.redirectToLogin("Acceso no autorizado");
            return false;
        }

        return true;
    }

    // Redirect to login with optional message
    static redirectToLogin(message) {
        if (message) alert(message);
        sessionStorage.clear();
        window.location.href = "login.html";
    }
}

// Login event listener
document.getElementById("loginButton").addEventListener("click", function () {
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    if (AuthManager.login(email, password)) {
        window.location.href = "Inicio.html";
    }
});

// On protected page
// if (AuthManager.checkAccess(["Admin"])) {
//     // Page-specific logic
// }
class AuthManager {
    static ADMIN_EMAIL = "admin";
    static ADMIN_PASSWORD = "admin1234";

    static generateToken(email, role) {
        const payload = {
            sub: email,
            role: role,
            iat: Math.floor(Date.now() / 1000),
            exp: Math.floor(Date.now() / 1000) + (60 * 60),
            jti: crypto.randomUUID()
        };

        return this.mockTokenGeneration(payload);
    }

    static mockTokenGeneration(payload) {
        const header = { alg: "HS256", typ: "JWT" };
        return `${btoa(JSON.stringify(header))}.${btoa(JSON.stringify(payload))}.signature`;
    }

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

    static isTokenExpired(expirationTime) {
        return Date.now() / 1000 > expirationTime;
    }

    static login(email, password) {
        // Strict admin-only authentication
        if (email !== this.ADMIN_EMAIL || password !== this.ADMIN_PASSWORD) {
            alert("Acceso denegado. Solo administradores pueden iniciar sesión.");
            return false;
        }

        const token = this.generateToken(email, "Admin");
        sessionStorage.setItem("token", token);
        return true;
    }

    static logout() {
        sessionStorage.removeItem("token");
        this.redirectToLogin("Sesión cerrada");
    }

    static checkAccess(allowedRoles) {
        const decodedToken = this.validateToken();
        if (!decodedToken) return false;

        if (!allowedRoles.includes(decodedToken.role)) {
            this.redirectToLogin("Acceso no autorizado");
            return false;
        }

        return true;
    }

    static redirectToLogin(message) {
        if (message) alert(message);
        sessionStorage.clear();
        window.location.href = "login.html";
    }
}

document.getElementById("loginButton").addEventListener("click", function () {
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    if (AuthManager.login(email, password)) {
        window.location.href = "Inicio.html";
    }
});


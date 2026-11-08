import jwt from "jsonwebtoken";

// Middleware 1: Lee el token JWT (de cookie o header) y verifica quién es el usuario
export const autenticarJWT = (req, res, next) => {
    const cookieToken = req.headers.cookie
        ?.split("; ")
        .find((c) => c.startsWith("token="))
        ?.split("=")[1];

    const headerToken = req.headers.authorization?.startsWith("Bearer ")
        ? req.headers.authorization.split(" ")[1]
        : null;

    const token = cookieToken || headerToken;

    if (token) {
        try {
            req.usuario = jwt.verify(
                token,
                process.env.JWT_SECRET || "mi-clave-secreta"
            );
        } catch (error) {
            req.usuario = null;
        }
    } else {
        req.usuario = null;
    }

    res.locals.currentPath = req.path; // Variable disponible en las vistas Pug
    res.locals.usuario = req.usuario;

    next();
};

// Middleware 2: Verificación de rol (acepta uno o varios roles)
export const verificarRol = (...rolesPermitidos) => {
    return (req, res, next) => {
        if (!req.usuario) {
            return res.status(401).json({
                mensaje: "No estás logueado",
            });
        }

        if (!rolesPermitidos.includes(req.usuario.rol)) {
            return res.status(403).json({
                mensaje: "No tenés permisos",
            });
        }

        next();
    };
};
import bcrypt from "bcryptjs";
import Usuario from "../models/Usuario.js";
import jwt from "jsonwebtoken";
export const mostrarLogin = (req, res) => {
    res.render("login", {
        registrado: req.query.registrado === "1"
    });
};

export const iniciarSesion = async (req, res) => {
    try {
        const { email, password } = req.body ?? {};

        // Validación en backend (400 Bad Request) por si llaman desde Thunder Client sin datos
        if (!email || !password || email.trim() === "" || password.trim() === "") {
            return res.status(400).json({ mensaje: "Faltan datos obligatorios" });
        }

        const usuario = await Usuario.findOne({ email: email.trim().toLowerCase() });

        if (!usuario) {
            return res.status(401).json({ mensaje: "Credenciales inválidas" });
        }

        const passwordValida = await bcrypt.compare(password, usuario.passwordHash);

        if (!passwordValida) {
            return res.status(401).json({ mensaje: "Credenciales inválidas" });
        }

        // crea el token
        const token = jwt.sign(
            {
                email: usuario.email,
                rol: usuario.rol,
                clienteId: usuario.clienteId,
            },
            process.env.JWT_SECRET || "mi-clave-secreta",
            { expiresIn: "30m" }
        );

        // guarda el token en la cookie antes de redirigir.
        res.cookie("token", token, {
            httpOnly: true,
            maxAge: 30 * 60 * 1000,
        });

        if (usuario.rol === "admin") {
            return res.redirect("/clientes/vista");
        }

        if (usuario.rol === "visitante") {
            return res.redirect("/eventos/vista");
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ mensaje: "Error al iniciar sesión" });
    }
};

export const cerrarSesion = (req, res) => {
    res.clearCookie("token");
    res.redirect("/");
};
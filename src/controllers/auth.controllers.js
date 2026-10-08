import bcrypt from "bcryptjs";
import Usuario from "../models/Usuario.js";

export const mostrarLogin = (req, res) => {
    res.render("login");
};

export const iniciarSesion = async (req, res) => {
    const { email, password } = req.body;

    const usuario = await Usuario.findOne({ email });

    if (!usuario) {
        return res.status(401).json({ mensaje: "Credenciales inválidas" });
    }

    const passwordValida = await bcrypt.compare(password, usuario.passwordHash);

    if (!passwordValida) {
        return res.status(401).json({ mensaje: "Credenciales inválidas" });
    }

    req.session.usuario = {
        email: usuario.email,
        rol: usuario.rol
    };

    if (usuario.rol === "admin") {
        return res.redirect("/clientes/vista");
    }

    if (usuario.rol === "visitante") {
        return res.redirect("/eventos/vista");
    }
};

export const cerrarSesion = (req, res) => {
    req.session.destroy((error) => {
        if (error) {
            return res.status(500).send("No se pudo cerrar la sesión");
        }

        res.clearCookie("connect.sid");
        res.redirect("/");
    });
};
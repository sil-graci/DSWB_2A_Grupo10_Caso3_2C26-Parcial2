import { Resend } from "resend";

const resend = new Resend(
  process.env.RESEND_API_KEY
);

const enviarBienvenida = async (email,nombre) => {
  const { data, error } =
    await resend.emails.send({
      from:

      "Urbana Cult <onboarding@resend.dev>",

        to: [email],

        subject:
          "Bienvenido a Urbana Cult",

        html: `
          <h2>Bienvenido a Urbana Cult</h2>

          <p>
            Hola ${nombre || "visitante"}.
          </p>

          <p>
            Tu cuenta fue creada correctamente.
          </p>

          <p>
            <strong>Usuario:</strong>
            ${email}
          </p>

          <p>
            <strong>Contraseña temporal:</strong>
            1234
          </p>

          <p>
            Por seguridad, recordá cambiar la contraseña temporal asignada cuando ingreses al sistema.
          </p>

          <p>¡Esperamos que disfrutes de Urbana Cult!</p>
        `,
      });

  if (error) {
    throw new Error(
      "No se pudo enviar el email de prueba"
    );
  }

  return data;
};

export {
  resend,
  enviarBienvenida,
};
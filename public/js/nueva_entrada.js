const formularioCompra = document.getElementById("formCompraEntrada");
const mensajeCompra = document.getElementById("mensajeCompra");
const enlaceEntradas = document.getElementById("verEntradas");
const botonComprar = formularioCompra?.querySelector('button[type="submit"]');

if (formularioCompra && mensajeCompra && enlaceEntradas && botonComprar) {
  formularioCompra.addEventListener("submit", async (evento) => {
    evento.preventDefault();
    mensajeCompra.textContent = "Procesando la compra...";
    mensajeCompra.className = "mensaje-error";
    enlaceEntradas.hidden = true;
    botonComprar.disabled = true;

    const datos = Object.fromEntries(new FormData(formularioCompra));
    datos.cantidad = Number(datos.cantidad);

    try {
      const respuesta = await fetch(formularioCompra.action, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(datos),
      });
      const resultado = await respuesta.json();

      if (!respuesta.ok) {
        throw new Error(resultado.mensaje || "No se pudo completar la compra.");
      }

      mensajeCompra.textContent = resultado.mensaje || "Compra realizada correctamente.";
      mensajeCompra.className = "mensaje-exito";
      enlaceEntradas.hidden = false;
      formularioCompra.reset();
      const cantidad = document.getElementById("cantidad");
      if (cantidad) cantidad.value = "1";
    } catch (error) {
      mensajeCompra.textContent = error.message;
      mensajeCompra.className = "mensaje-aviso";
    } finally {
      botonComprar.disabled = false;
    }
  });
}

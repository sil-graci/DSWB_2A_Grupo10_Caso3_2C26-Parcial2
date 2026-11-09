import Evento from "../models/Evento.js";

const ID_DOLAR_OFICIAL = "dolar-oficial";
let ultimaCotizacionEnMemoria = null;
let ultimaCotizacionGuardada = null;

function coleccionCotizaciones() {
  return Evento.db.collection("cotizaciones");
}

async function consultarCotizacionOficial() {
  try {
    const respuesta = await fetch("https://dolarapi.com/v1/dolares/oficial", {
      signal: AbortSignal.timeout(2000),
    });
    if (!respuesta.ok) return null;

    const { venta } = await respuesta.json();
    return Number.isFinite(venta) && venta > 0 ? venta : null;
  } catch {
    return null;
  }
}

// MongoDB conserva la última cotización válida entre reinicios.
async function guardarCotizacion(venta) {
  ultimaCotizacionEnMemoria = venta;
  if (venta === ultimaCotizacionGuardada) return;

  try {
    await coleccionCotizaciones().updateOne(
      { _id: ID_DOLAR_OFICIAL },
      { $set: { venta, consultadaEn: new Date() } },
      { upsert: true },
    );
    ultimaCotizacionGuardada = venta;
  } catch (error) {
    console.warn("No se pudo guardar el respaldo de DolarAPI:", error.message);
  }
}

async function recuperarCotizacion() {
  if (ultimaCotizacionEnMemoria !== null) return ultimaCotizacionEnMemoria;

  try {
    const respaldo = await coleccionCotizaciones().findOne({
      _id: ID_DOLAR_OFICIAL,
    });
    const venta = respaldo?.venta;
    if (Number.isFinite(venta) && venta > 0) {
      ultimaCotizacionGuardada = venta;
      ultimaCotizacionEnMemoria ??= venta;
    }
  } catch (error) {
    console.warn("No se pudo leer el respaldo de DolarAPI:", error.message);
  }

  return ultimaCotizacionEnMemoria;
}

// Usa la última cotización válida si DolarAPI no responde.
export async function agregarPreciosUSD(eventos) {
  if (!eventos.some(({ precio }) => Number.isFinite(precio) && precio > 0)) {
    return eventos;
  }

  const cotizacionRecibida = await consultarCotizacionOficial();
  if (cotizacionRecibida !== null) {
    await guardarCotizacion(cotizacionRecibida);
  }

  const cotizacion = cotizacionRecibida ?? (await recuperarCotizacion());
  if (cotizacion === null) return eventos;

  return eventos.map((evento) => {
    const { precio } = evento;
    if (!Number.isFinite(precio) || precio <= 0) return evento;

    const precioUSD = precio / cotizacion;
    return Number.isFinite(precioUSD)
      ? {
          ...(typeof evento.toJSON === "function" ? evento.toJSON() : evento),
          precioUSD,
          usaUltimaCotizacion: cotizacionRecibida === null,
        }
      : evento;
  });
}

class Evento {
    constructor(id, titulo, descripcion, fecha, hora, salaId, estado) {
        this.id = id;
        this.titulo = titulo;
        this.descripcion = descripcion;
        this.fecha = fecha;
        this.hora = hora;
        this.salaId = salaId;
        this.estado = estado;
    }
}

export default Evento;
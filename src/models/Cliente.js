import mongoose from "mongoose";

const clienteSchema = new mongoose.Schema(
  {
    nombre: {
      type: String,
      required: true,
      trim: true,
    },

    apellido: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      trim: true,
    },

    telefono: {
      type: String,
      required: true,
      trim: true,
      match: /^\d+$/
}
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Cliente", clienteSchema);





// class Cliente {
//     constructor(id, nombre, apellido, email, telefono) {
//         this.id=id;
//         this.nombre=nombre;
//         this.apellido=apellido;
//         this.email=email;
//         this.telefono=telefono; 
//     }
// }
// export default Cliente;
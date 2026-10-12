import mongoose from "mongoose";

const clienteSchema = new mongoose.Schema(
  {
    nombre: {
      type: String,
      required: false,
      trim: true,
    },

    apellido: {
      type: String,
      required: false,
      trim: true,
    },

    dni: {
      type: String,
      required: true,
      unique: true,
      trim: true,

      validate: {
        validator: (valor) =>
          /^\d{8}$/.test(valor),

        message:
          "El DNI debe contener 8 dígitos",
      },
    },
    
    email: {
      type: String,
      required: true,
      trim: true,
    },
      
    telefono: {
      type: String,
      required: false,
      trim: true,

      validate: {
        validator: (valor) =>
          valor === "" ||
          /^\d{8,15}$/.test(valor),

        message:
          "El teléfono debe contener entre 8 y 15 números",
      },
    },  
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Cliente", clienteSchema);

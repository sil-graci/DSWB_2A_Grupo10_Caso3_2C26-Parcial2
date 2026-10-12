import mongoose from "mongoose";

const usuarioSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true
    },
    passwordHash: {
        type: String,
        required: true
    },
    rol: {
        type: String,
        enum: ["admin", "visitante"],
        required: true
    },
    clienteId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Cliente",        
    }
    
});

export default mongoose.model("Usuario", usuarioSchema);
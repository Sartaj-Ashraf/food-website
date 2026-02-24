import mongoose from "mongoose";
const { Schema } = mongoose;

const AddressesSchema = new Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "moonlightUser",
        unique: true,
    },
    addresses: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "MoonlightAddress",
        required: true,
    }]
}, { timestamps: true });

export default mongoose.model("MoonlightAddresses", AddressesSchema);







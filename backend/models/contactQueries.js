import mongoose from "mongoose";
const contactQueriesSchema = new mongoose.Schema({
    name: {
        type: String,
    },
    phoneNumber: {
        type: String,
        required: true
    },
    message: {
        type: String,
    },

}, {
    timestamps: true,
})

export default mongoose.model("moonlightContactQueries", contactQueriesSchema);

import mongoose from "mongoose";

const packageSchema = new mongoose.Schema({
	name: String,
	description: String,
	price: Number,
	expirationDate: String,
	createdBy: {
		type: mongoose.Schema.Types.ObjectId,
		ref: "User",
	},
});

export default mongoose.model("Package", packageSchema);

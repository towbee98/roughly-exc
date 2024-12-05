import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
	name: String,
	email: String,
	password: String,
	packages: [
		{
			type: mongoose.Schema.Types.ObjectId,
			ref: "Package",
		},
	],
});

export default mongoose.model("User", userSchema);

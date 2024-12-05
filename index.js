import { ApolloServer } from "@apollo/server";
import { startStandaloneServer } from "@apollo/server/standalone";
import { typeDefs, resolvers } from "./schema.js";
import mongoose from "mongoose";
import dotenv from "dotenv";
import context from "./contexts/context.js";

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI;

(async () => {
	try {
		// Connect to MongoDB
		await mongoose.connect(MONGODB_URI, {});
		console.log("Connected to MongoDB");

		const server = new ApolloServer({
			typeDefs,
			resolvers,
			introspection: true,
			includeStacktraceInErrorResponses: false,
		});

		const { url } = await startStandaloneServer(server, {
			listen: { port: 4000 },
			context,
		});

		console.log("server running at port " + 4000);
	} catch (error) {
		console.error("Error connecting to MongoDB:", error);
	}
})();

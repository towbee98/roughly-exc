import jwt from "jsonwebtoken";
import throwCustomError, { ErrorTypes } from "../helpers/errorHandler.js";

const getUser = async (token) => {
	try {
		if (token) {
			const user = jwt.verify(token, process.env.JWT_SECRET_KEY);
			return user;
		}
		return null;
	} catch (error) {
		return null;
	}
};

const context = async ({ req, res }) => {
	if (req.body.operationName === "IntrospectionQuery") {
		return {};
	}
	console.log(req.body.operationName);

	if (
		req.body.operationName === "SignUp" ||
		req.body.operationName === "Login" ||
		req.body.operationName === "fetchPackages" ||
		req.body.operationName === "fetchPackage"
	) {
		return {};
	}

	// get the user token from the headers
	const token = req.headers.authorization || "";

	// try to retrieve a user with the token
	const user = await getUser(token);

	if (!user) {
		throwCustomError("User is not Authenticated", ErrorTypes.UNAUTHENTICATED);
	}

	// add the user to the context
	return { user };
};

export default context;

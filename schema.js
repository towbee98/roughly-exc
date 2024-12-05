// name, description, price, expiration date
import bcrypt from "bcryptjs";
import Package from "./models/packages.js";
import User from "./models/user.js";
import { Types } from "mongoose";
import throwCustomError, { ErrorTypes } from "./helpers/errorHandler.js";
import jwt from "jsonwebtoken";
export const typeDefs = `#graphql 
scalar DateTime

input SignupInput {
    email: String!
    password: String!
    name: String!
  }

  input LoginInput {
    email: String!
    password: String!
  }

  input PackageInput {
    name: String!
    description: String!
    price: Float!
    expirationDate: String!
  }

  type JwtToken {
    token: String!
  }

  type UserWithToken {
    _id: String
    email: String
    name: String
    createdAt: DateTime
    updatedAt: DateTime
    userToken: JwtToken
  }


type Package{
    id:ID
    name: String!
    description: String!
    price: Float!
    expirationDate: String!
    createdBy:User

}

type User{
    id:ID
    name: String!
    email: String!
    password: String!
    packages: [Package]
}

type Query{
    packages: [Package]
    users: [User]
    package(id:ID!): Package
}

type Mutation{
    deletePackage(id:ID!):[Package]
    createPackage(packageInput: PackageInput!): Package
    editPackage(id: ID!, packageInput: PackageInput): Package
    
    login(input: LoginInput!): UserWithToken
    signup(input: SignupInput!): UserWithToken
}
`;

export const resolvers = {
	Query: {
		packages: async () => {
			const packages = await Package.find();
			return packages;
		},
		users: async () => {
			const users = await User.find();
			return users;
		},
		package: async (parent, { id }) => {
			if (!Types.ObjectId.isValid(id)) {
				throw new Error("Invalid ID format");
			}

			const package_ = await Package.findById(id);

			if (!package_) {
				throw new Error("Package not found");
			}
			return package_;
		},
	},
	Package: {
		createdBy: async (parent, { id }) => {
			if (!Types.ObjectId.isValid(id)) {
				throw new Error("Invalid ID format");
			}
			const user = await User.findById(parent.createdBy);
			if (!user) {
				throw new Error("User not found");
			}
			return user;
		},
	},

	User: {
		packages: async (parent, { id }) => {
			if (!Types.ObjectId.isValid(id)) {
				throw new Error("Invalid ID format");
			}
			const packages = await Package.find({ createdBy: parent.id });
			if (!packages) {
				throw new Error("Packages not found");
			}
			return packages;
		},
	},

	Mutation: {
		deletePackage: async (parent, { id }) => {
			if (!Types.ObjectId.isValid(id)) {
				throw new Error("Invalid ID format");
			}
			const package_ = await Package.findByIdAndDelete(id);
			if (!package_) {
				throw new Error("Package not found");
			}
			return package_;
		},

		createPackage: async (
			parent,
			{ packageInput: { name, description, price, expirationDate } },
			contextValue
		) => {
			console.log(contextValue);
			const package_ = await Package.create({
				name,
				description,
				price,
				expirationDate,
				createdBy: contextValue.user.id,
			});
			console.log(package_);
			return {
				name: package_.name,
				description: package_.description,
				price: package_.price,
				expirationDate: package_.expirationDate,
				createdBy: `${package_.createdBy}`,
			};
		},

		editPackage: async (
			parent,
			{ id, packageInput: { name, description, price, expirationDate } },
			contextValue
		) => {
			if (!contextValue.user) {
				throwCustomError(
					"User is not authenticated",
					ErrorTypes.UNAUTHENTICATED
				);
			}
			const package_ = await Package.findByIdAndUpdate(
				id,
				{ name, description, price, expirationDate },
				{ new: true }
			);
			return package_;
		},

		login: async (parent, { input: { email, password } }) => {
			const user = await User.findOne({ email });
			if (!user) {
				throw new Error("User not found");
			}
			const isPasswordValid = await bcrypt.compare(password, user.password);
			if (!isPasswordValid) {
				throw new Error("Invalid password");
			}
			const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET_KEY);
			return {
				_id: user._id,
				email: user.email,
				name: user.name,
				createdAt: user.createdAt,
				updatedAt: user.updatedAt,
				userToken: {
					token,
				},
			};
		},
		signup: async (parent, { input: { name, email, password } }) => {
			const userExists = await User.findOne({ email });
			if (userExists) {
				throw new Error("User already exists");
			}
			const hashedPassword = await bcrypt.hash(password, 10);
			const user = await User.create({
				name,
				email,
				password: hashedPassword,
			});
			const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET_KEY);
			return {
				_id: user._id,
				email: user.email,
				name: user.name,
				createdAt: user.createdAt,
				updatedAt: user.updatedAt,
				userToken: {
					token,
				},
			};
		},
	},
};

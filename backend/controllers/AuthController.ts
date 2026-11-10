import Express from "express";
import bcrypt from "bcryptjs";
import User from "../models/userModel.js"; // Adjust path to your user model
import Seller from "../models/sellerModel.js";
import jwt from "jsonwebtoken";
const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_dumb_shit_key';
const JWT_EXPIRES_IN = '1d'; // Token lasts 1 day

// Helper to generate token
const generateToken = (userId: string): string => {
  return jwt.sign({ id: userId }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
};

export const authController = {

    // Register a new user
    registerUser: async (req: Express.Request, res: Express.Response) => {
        try {
            const { username, email, password } = req.body;

            // Basic validation
            if (!username || !email || !password) {
                return res.status(400).json({ message: "All fields are required, buddy." });
            }

            // Check if user already exists
            const existingUser = await User.findOne({ email });
            if (existingUser) {
                return res.status(400).json({ message: "An account with this email already exists." });
            }

            // Hash the password securely with bcrypt
            const saltRounds = 10;
            const hashslingingPassword = await bcrypt.hash(password, saltRounds);

            // Create the new user with the hashed password
            const newUser = await User.create({
                username:username,
                emailaddress: email,
                password: hashslingingPassword,
               
            });

            // Strip password before sending response back
            const userResponse = {
                id: newUser._id,
                username: newUser.username,
                email: newUser.emailaddress
            };

            console.log(`New user registered: ${username}. The machine grows.`);
            return res.status(201).json({ message: "User registered successfully", user: userResponse });

        } catch (error) {
            console.error("Registration error:", error);
            return res.status(500).json({ message: "Failed to register user", error });
        }
    },

    // Log in an existing user
    loginUser: async (req: Express.Request, res: Express.Response) => {
        try {
            const { email, password } = req.body;

            if (!email || !password) {
                return res.status(400).json({ message: "Email and password are required." });
            }

            // Find user by email
            const user = await User.findOne({ emailaddress: email });
            if (!user) {
                return res.status(401).json({ message: "Invalid credentials. Nice try." });
            }

            // Compare incoming password with stored bcrypt hash
            const isPasswordValid = await bcrypt.compare(password, user.password);
            if (!isPasswordValid) {
                return res.status(401).json({ message: "Invalid credentials. Nice try." });
            }

            const token = generateToken(user._id.toString());

            console.log(`User logged in: ${user.username}`);
            return res.status(200).json({ 
                message: "Logged in successfully",
                token,
                user: {
                    id: user._id,
                    username: user.username,
                    email: user.emailaddress
                }
            });

        } catch (error) {
            console.error("Login error:", error);
            return res.status(500).json({ message: "Failed to log in", error });
        }
    },

    // Register a new seller
    registerSeller: async (req: Express.Request, res: Express.Response) => {
        try {
            const { sellername, emailaddress,sellerthumbnailurl } = req.body;

            if (!sellername || !emailaddress) {
                return res.status(400).json({ message: "Seller name and email are required." });
            }

            const newSeller = await Seller.create({
                sellername,
                emailaddress,
                sellerthumbnailurl: sellerthumbnailurl || ""
            });

            console.log(`New seller registered: ${sellername}`);
            return res.status(201).json({ message: "Seller registered successfully", seller: newSeller });

        } catch (error) {
            console.error("Seller registration error:", error);
            return res.status(500).json({ message: "Failed to register seller", error });
        }
    },

    // Log in an existing seller
    loginSeller: async (req: Express.Request, res: Express.Response) => {
        try {
            const { email, password } = req.body;

            if (!email || !password) {
                return res.status(400).json({ message: "Email and password are required, moron." });
            }

            // Find seller by email
            const seller = await Seller.findOne({ emailaddress: email });
            if (!seller) {
                return res.status(401).json({ message: "Invalid credentials. Damn you suck!." });
            }

            // Compare incoming password with stored bcrypt hash
            const isPasswordValid = await bcrypt.compare(password, seller.password);
            if (!isPasswordValid) {
                return res.status(401).json({ message: "Invalid credentials. Nice try, buttmunch." });
            }

            const token = jwt.sign(
                { id: seller._id, sellername: seller.sellername, email: seller.emailaddress },
                JWT_SECRET,
                { expiresIn: "24h" }
            );

            console.log(`Seller logged in: ${seller.sellername}`);
            return res.status(200).json({ 
                message: "Logged in successfully, buttmunch",
                token,
                seller: {
                    id: seller._id,
                    sellername: seller.sellername,
                    email: seller.emailaddress
                }
            });

        } catch (error) {
            console.error("Seller login error:", error);
            return res.status(500).json({ message: "Failed to log in seller,dumbass", error });
        }
    },


};
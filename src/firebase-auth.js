import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from "firebase/auth";
import app from "./firebaseConfig";

const auth = getAuth(app);

// Register a new user
export const registerUser = async (email, password) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  } catch (error) {
    throw new Error(error.message);
  }
};

// Log in an existing user
export const loginUser = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  } catch (error) {
    throw new Error(error.message);
  }
};

// Log out the current user
export const logoutUser = async () => {
  try {
    await signOut(auth);
  } catch (error) {
    throw new Error(error.message);
  }
};

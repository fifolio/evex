import mongoose, { Connection } from 'mongoose';

/**
 * Global cache for MongoDB connection to prevent multiple connections
 * during development hot reloads in Next.js
 */
declare global {
    // This is necessary to make the global variable type-safe
    var mongoose: {
        conn: Connection | null;
        promise: Promise<Connection> | null;
    } | undefined;
}

/**
 * Cached connection object to store the MongoDB connection
 */
const cached: {
    conn: Connection | null;
    promise: Promise<Connection> | null;
} = global.mongoose || {
    conn: null,
    promise: null,
};

// Store the cached object globally to persist across hot reloads
if (!global.mongoose) {
    global.mongoose = cached;
}

/**
 * Connects to MongoDB using Mongoose with connection caching
 * This prevents multiple connections during development hot reloads
 *
 * @returns Promise<Connection> - The MongoDB connection object
 * @throws Error if connection fails or MONGODB_URI is not defined
 */
async function connectToDatabase(): Promise<Connection> {
    // Return existing connection if already connected
    if (cached.conn) {
        console.log('Using existing MongoDB connection');
        return cached.conn;
    }

    // Return existing promise if connection is in progress
    if (cached.promise) {
        console.log('Waiting for existing MongoDB connection');
        cached.conn = await cached.promise;
        return cached.conn;
    }

    // Get MongoDB URI from environment variables
    const MONGODB_URI = process.env.MONGODB_URI;

    if (!MONGODB_URI) {
        throw new Error('Please define the MONGODB_URI environment variable');
    }

    console.log('Connecting to MongoDB...');

    try {
        // Create connection promise with optimized settings
        cached.promise = mongoose.connect(MONGODB_URI, {
            // Connection options for better performance and reliability
            bufferCommands: false, // Disable mongoose buffering
            maxPoolSize: 10, // Maintain up to 10 socket connections
            serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
            socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
            family: 4, // Use IPv4, skip trying IPv6
        }).then((mongooseInstance) => {
            console.log('Successfully connected to MongoDB');
            return mongooseInstance.connection;
        });

        // Wait for connection and cache it
        cached.conn = await cached.promise;
        return cached.conn;

    } catch (error) {
        // Reset cached promise on error to allow retry
        cached.promise = null;
        console.error('MongoDB connection error:', error);
        throw error;
    }
}

export default connectToDatabase;
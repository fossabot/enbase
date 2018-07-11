process.on("unhandledRejection", (reason, p) => {
    console.log("Unhandled Rejection at: Promise", p, "reason:", reason);
    // application specific logging, throwing an error, or other logic here
});
import {Enbase} from "./Enbase";

new Enbase().connect({
    port: process.env.PORT || 3000,
    mongoName: process.env.MONGO_NAME || 'enbase',
    mongoUrl: process.env.MONGO_URL || 'mongodb://localhost:27017'
});

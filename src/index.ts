import express from "express";
import http from "http";
import { Server } from "socket.io";
import proxy from "express-http-proxy";
import { MongoClient } from "mongodb";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";

const app = express();
const port = process.env.PORT || 4500;
const frontendPort = process.env.FRONTEND_PORT || 4501;
const apiPort = process.env.API_PORT || 4502;
const frontend = proxy(`http://localhost:${frontendPort}`, {});
const api = proxy(`http://localhost:${apiPort}`);

const servlet = http.createServer(app);
const io = new Server(servlet);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

const dbclient = new MongoClient(
    "mongodb://localhost:27017/opendocs_testing"
);

async function main() {
    servlet.listen(port, () => {
        console.log(
            `⚡️ [server] App listening on port ${port} (Frontend on port ${frontendPort}, API on port ${apiPort}).`
        );
    });
    try {
        await dbclient.connect();
        console.log("Connected to database!");
        await import("./database/models/UserData");
        io.on("connection", (socket) => {
            console.log(
                `${socket.id} | Client connected!    | { id: ${socket.id}, ip: ${socket.handshake.address} }`
            );
            socket.on("request_data", () => {
                // const id = "61ba64ed142ea93ba3343990";
                socket.emit("initialUserData", {});
            });
            socket.on("disconnect", () => {
                console.log(
                    `${socket.id} | Client disconnected! | { id: ${socket.id}, ip: ${socket.handshake.address} }`
                );
            });
        });

        // Routes
        app.get("/api", api);
        app.get("/api/*", api);
        app.post("/api", api);
        app.post("/api/*", api);

        app.get("/*", frontend);
        app.post("/*", frontend);
    } catch (err) {
        console.log(err);
        app.get("*", (req, res) => {
            res.status(500);
            res.type("text/plain");
            res.send(
                "500 | Could not connect to database. Please try again later."
            );
        });
    } finally {
        dbclient.close();
    }
}

main();

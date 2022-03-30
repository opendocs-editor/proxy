import express from "express";
import http from "http";
import { Server } from "socket.io";
import proxy from "express-http-proxy";
import { MongoClient } from "mongodb";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import fileUpload from "express-fileupload";
import path from "path";
import * as uuid from "uuid";
import fs from "fs";
import * as mime from "mime-types";

const app = express();
const port = process.env.PORT || 4500;
// const frontendPort = process.env.FRONTEND_PORT || 4501;
const frontendPort = process.env.FRONTEND_PORT || 8086;
const apiPort = process.env.API_PORT || 4502;
const frontend = proxy(
    `http://${process.env.FRONTEND_HOST || "localhost"}:${frontendPort}`,
    {}
);
const api = proxy(`http://${process.env.API_HOST || "localhost"}:${apiPort}`);

const servlet = http.createServer(app);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(fileUpload({}));

const dbclient = new MongoClient(
    `mongodb://${process.env.MONGODB_HOST || "localhost"}:${
        process.env.MONGODB_PORT || 27017
    }/opendocs_testing`
);

async function main() {
    try {
        await dbclient.connect();
        console.log("Connected to database!");
        await import("./database/models/UserData");

        const io = new Server(servlet);

        io.on("connection", (socket) => {
            console.log(
                `${socket.id} | Client connected!    | { id: ${socket.id}, ip: ${socket.handshake.address} }`
            );
            socket.on("request_data", () => {
                // const id = "61ba64ed142ea93ba3343990";
                socket.emit("initialUserData", {});
            });
            socket.on("document", () => {
                console.log(`Document?`);
            });
            socket.on("disconnect", () => {
                console.log(
                    `${socket.id} | Client disconnected! | { id: ${socket.id}, ip: ${socket.handshake.address} }`
                );
            });
        });

        console.log("Socket set up!");

        // Image uploads
        app.post("/api/v1/editor/image/upload", async (req, res) => {
            const files = req.files;
            if (!files)
                return res
                    .status(400)
                    .send("There was an error uploading the image.");
            const k = Object.keys(files);
            for (let i = 0; i < k.length; i++) {
                const k_ = k[i];
                const f = files[k_];
                if (Array.isArray(f)) {
                    // TODO: do something here
                } else {
                    const fuuid = uuid.v4();
                    const fname =
                        fuuid +
                        "." +
                        f.name.split(".")[f.name.split(".").length - 1];
                    await f.mv(path.join(__dirname, "..", "images", fname));
                    return res.send({
                        location: `/api/v1/editor/image/get/${fname}`,
                    });
                }
            }
            return res.send({ location: "/" });
        });

        // Complete auth
        app.get("/complete_auth", (req, res) => {
            console.log("Auth complete");
            io.emit("complete_auth");
            res.send("Done");
        });

        // Get images
        app.get("/api/v1/editor/image/get/:image", (req, res) => {
            if (
                fs.existsSync(
                    path.join(__dirname, "..", "images", req.params.image)
                )
            ) {
                res.status(200);
                res.type(
                    mime.lookup(
                        path.join(__dirname, "..", "images", req.params.image)
                    ) || "image/png"
                );
                return res.end(
                    fs.readFileSync(
                        path.join(__dirname, "..", "images", req.params.image)
                    )
                );
            } else {
                return res.status(404).end("That image doesn't exist!");
            }
        });

        // Routes
        app.get("/api", api);
        app.get("/api/*", api);
        app.post("/api", api);
        app.post("/api/*", api);

        app.get("/*", frontend);
        app.post("/*", frontend);

        servlet.listen(port, () => {
            console.log(`⚡️ [server] Proxy listening on port ${port}.`);
        });
    } catch (err) {
        console.log(err);
        app.get("*", (req, res) => {
            res.status(500);
            res.type("text/plain");
            res.send(
                "500 | Could not connect to database. Please try again later."
            );
        });

        servlet.listen(port, () => {
            console.log(`⚡️ [server] Proxy listening on port ${port}.`);
        });
    } finally {
        dbclient.close();
    }
}

main();

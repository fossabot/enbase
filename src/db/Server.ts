import * as express from "express";
import * as http from "http";

const consola = require('consola');

/**
 * Api server, that provides websocket interface for Firebase SDKs
 */
export class Server {
    private _app: express.Application;
    private _http: http.Server;

    constructor() {
        this._app = express();
    }

    /**
     * Listen http and ws connections on specific port
     *
     * @param port - port, on which server should listen connections
     */
    public listen(port) {
        this._http = this._app.listen(port, () => {
            consola.ready(`Listening on port: ${port}`);
        });
    }

    get app(): express.Application {
        return this._app;
    }

    get http(): http.Server {
        return this._http;
    }
}

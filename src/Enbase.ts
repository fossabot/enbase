import {Database} from "./Database";
import {Handler} from "./db/Handler";
import {EntityRepository} from "./db/repositories/EntityRepository";
import {SecurityChecker} from "./db/security/SecurityChecker";
import {Server} from "./db/Server";

/**
 * Class representing an Enbase platform instance
 */
export class Enbase {
    private server: Server;
    private port: any;
    private database: Database;
    private mongoUrl: string;
    private mongoDatabase: string;
    private entityRepository: EntityRepository;
    private handler: Handler;
    private securityChecker: SecurityChecker;

    constructor() {

    }

    connect({ port, mongoUrl, mongoName }) {
        return new Promise((resolve, reject) => {
            this.port = port;
            this.mongoUrl = mongoUrl;
            this.mongoDatabase = mongoName;
            this.database = new Database();
            this.database.connect(this.mongoUrl, this.mongoDatabase).then(() => {
                this.server = new Server();
                this.server.listen(this.port);
                this.entityRepository = new EntityRepository(this.database);
                this.securityChecker = new SecurityChecker(this.entityRepository);
                this.entityRepository.supplySecurityChecker(this.securityChecker);
                this.securityChecker.compile(process.env.RULES_PATH || "./../../../rules.json");
                this.handler = new Handler(this.server, this.entityRepository);
                resolve();
            });
        });
    }

    async close() {
        return new Promise((resolve, reject) => {
            this.server.http.close();
            this.handler.close();
            this.database.close();
            resolve();
        });
    }
}

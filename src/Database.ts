import { MongoClient } from "mongodb";

const promiseUtils: any = require('bluebird');
const consola = require('consola');
promiseUtils.promisifyAll(MongoClient);

/**
 * Database, provide fresh database connection to MongoDB
 */
export class Database {
    private connection;
    private _db;

    /**
     *
     * @param {String} url - MongoDB connection url
     * @param {String} name - database name in MongoDB
     * @returns {Promise<void>}
     */
    public async connect(url: string, name: string) {
        try {
            this.connection = await MongoClient.connect(url.toString(), {
                useNewUrlParser: true,
            });
            consola.success("Connected to database");
            this._db = this.connection.db(name);
        } catch (err) {
            consola.error(err);
            throw err;
        }
    }

    get db() {
        return this._db;
    }

    close() {
        this.connection.close();
    }
}

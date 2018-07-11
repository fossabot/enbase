import {rejects} from "assert";
import * as consola from "consola";
import {Database} from "../../Database";
import {IRead} from "../interfaces/IRead";
import {IWrite} from "../interfaces/IWrite";
import {SecurityChecker} from "../security/SecurityChecker";
import {DatabaseAction} from "../security/types";
import {mergeDeep} from "../utils/utils";

const _ = require("lodash");

/**
 * An entity repository. Used to operate with Entity model
 */
export class EntityRepository implements IWrite, IRead {

    private collection: any;
    private _adapter: any;
    private securityChecker: SecurityChecker;

    constructor(database: Database) {
        this.collection = database.db.collection("entities");
    }

    public supplySecurityChecker(securityChecker: SecurityChecker) {
        this.securityChecker = securityChecker;
    }

    /**
     * Read data on specific path reference
     * @param {string} path
     * @param auth
     * @param skipPermissions
     * @returns {Promise<Object>}
     */
    public async read(path: string, auth: object | null, skipPermissions: boolean | null): Promise<Object> {
        consola.info(`Reading data from ${path}`);
        let docs = await this.collection.find({path: {$regex: `^${path}`}}).toArray();
        docs = docs.map((doc) => {
            doc.path = doc.path.replace(path, "");
            return doc;
        });
        let output = {};
        for (const doc of docs) {
            let str = "";
            for (const key of doc.path.split("/")) {
                if (key.length > 0) {
                    str = `${str}${key}.`;
                }
            }
            if (str.slice(0, -1).length > 0) {
                if (await this.securityChecker.validate(DatabaseAction.READ, `/${path}${doc.path}`, null, auth)) {
                    _.set(output, str.slice(0, -1), doc.value);
                }
            } else {
                if (await this.securityChecker.validate(DatabaseAction.READ, `/${path}${doc.path}`, null, auth)) {
                    output = doc.value;
                }
            }
        }
        return output;
    }

    /**
     * Recursive write data to database on specific reference
     * @param {string} path - path reference to data location in tree
     * @param {Object} data - some data
     * @param auth
     * @param skipPermissions
     * @returns {Promise<Object>}
     */
    public async set(path: string, data: object | null, auth: object | null, skipPermissions: boolean | null): Promise<any> {
        consola.info(`Writing data to ${path || "/"}`);
        if (!data) {
            if (!skipPermissions && (!await this.securityChecker.validate(DatabaseAction.REMOVE, `/${path}`, null, auth))) { return; }
            await this.collection.deleteMany({path: {$regex: `^${path}`}});
            this._adapter.notifyChanges(path, null);
            return;
        } else {
            if (!skipPermissions && !(await this.securityChecker.validate(DatabaseAction.WRITE, `/${path}`, data, auth))) { return; }
            for (const [key, value] of Object.entries(data)) {
                if (value instanceof Object) {
                    await this.set(`${path}/${key}`, value, auth, skipPermissions);
                } else {
                    const count = (await this.collection.find({path: `${path}/${key}`}).toArray()).length;
                    if (count < 1) {
                        const entity = this.collection.insert({path: `${path}/${key}`, value});
                    } else {
                        const entity = await this.collection.findOne({path: `${path}/${key}`});
                        entity.value = value;
                        await this.collection.update({_id: entity._id}, entity);
                    }
                    this._adapter.notifyChanges(path, data);
                }
            }
        }
    }

    /**
     * Update data on database on specific reference
     * @param {string} path
     * @param {Object} data
     * @param auth
     * @returns {Promise<Object>}
     */
    public async update(path: string, data: object, auth: object | null): Promise<Object> {
        let currentData = await this.read(path, auth, false);
        currentData = mergeDeep(currentData, data);
        await this.set(path, currentData, auth, false);
        return currentData;
    }

    set adapter(value: any) {
        this._adapter = value;
    }
}

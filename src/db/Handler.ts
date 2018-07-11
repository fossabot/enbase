import * as express from "express";
import firebaseAdapter from "firebase-websockets-adapter";
import {EntityRepository} from "./repositories/EntityRepository";
import {Server} from "./Server";

/**
 * Handler, handles database routes and ws connections
 */
export class Handler {
    private adapter: any;
    private entityRepository: EntityRepository;
    private server: Server;

    /**
     * Attach router and finally websockets adapter for handling connections
     * @param server
     * @param entityRepository
     */
    constructor(server: Server, entityRepository: EntityRepository) {
        this.server = server;
        this.entityRepository = entityRepository;
        this.registerFirebaseAdapter();
    }

    /**
     * Register firebase database adapter, that handles websockets connections from Firebase SDKs
     */
    private registerFirebaseAdapter() {
        this.adapter = firebaseAdapter(this.server.http);
        this.entityRepository.adapter = this.adapter;
        this.adapter.handleSet(this.handleSet.bind(this));
        this.adapter.handleUpdate(this.handleUpdate.bind(this));
        this.adapter.handleRead(this.handleRead.bind(this));
    }

    /**
     * Handle set action. Save to Database
     * @param path {string} - tree structure path, pointing place, where the data should be stored
     * @param auth
     * @param data {Object} - data to be updated
     * @param callback {VoidFunction} - callback, that signaling, operation was finished
     */
    private handleSet(path: string, auth: object | null, data: object | null, callback: (data) => void) {
        this.entityRepository.set(path, data, auth, false).then((data) => {
            callback(data);
        }).catch((err) => console.log(err));
    }

    /**
     * Handle update action. Updates in Database
     * @param path {string} - tree structure path, pointing place, where the data should be updated
     * @param auth
     * @param data {Object} - data to be updated
     * @param callback {VoidFunction} - callback, that signaling, operation was finished
     */
    private handleUpdate(path: string, auth: object | null, data: object, callback: (data) => void) {
        this.entityRepository.update(path, data, auth).then(() => {
            callback(data);
        });
    }

    /**
     * Handle read action. Return tree structure
     * @param path {String} - tree structure path, pointing place, from where the data should be loaded
     * @param auth
     * @param callback {VoidFunction} - callback, that signaling, operation was finished
     */
    private handleRead(path: string, auth: object | null, callback: (data) => void) {
        this.entityRepository.read(path, auth, false).then((data) => {
            callback(data);
        }).catch((err) => console.log(err));
    }

    public close() {
        this.adapter.close();
    }
}

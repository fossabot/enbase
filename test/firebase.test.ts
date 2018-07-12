import {Enbase} from "../src/Enbase";

const firebase = require('firebase');
const MongoClient = require('mongodb').MongoClient;
const url = process.env.MONGO_URL || "mongodb://mongo:27017/";

let server: Enbase = new Enbase();
let dbInst;
let dbo;
let app;

describe('crud operations', () => {

    beforeAll((done) => {
        app = firebase.initializeApp({
            apiKey: "AIzaSyCqOohFHtF8JlC3tExsr8p1Oz-P8yVXkDs",
            databaseURL: `ws://localhost:3000`
        });

        MongoClient.connect(url, (err, db) => {
            if (err) throw err;
            dbInst = db;
            dbo = dbInst.db("enbase");
            dbo.createCollection("entities", (err, res) => {
                if (err) throw err;
                server.connect({
                    port: 3000,
                    mongoName: 'enbase',
                    mongoUrl: "mongodb://localhost:27017"
                }).then(() => {
                    done();
                }).catch(err => console.log(err));
            });
        });
    });

    afterEach((done) => {
        dbo.dropCollection('entities', (err, delOk) => {
            done();
        });
    }, 5000);

    afterAll((done) => {
        server.close().then(() => {
            dbInst.close(() => {
                done();
            });
        }).catch(err => console.log(err));
    });

    let scenarios = ['set', 'remove', 'update'];

    for (let scenario of scenarios) {
        test(('should write object data') + ((scenario == 'remove') ? ' and remove data' : '') + ((scenario == 'update') ? ' and update data' : ''), async () => {
            let data = {
                hello: 'world'
            };
            let updatedData = {
                hello: 'world_updated'
            };
            let ref = app.database().ref('/test' + (scenario == 'update' ? '_update' : '')).child('object');
            let performed = false;
            ref.once('value', (snap) => {
                const val = snap.val();
                if (scenario == 'remove' && performed) {
                    expect(val).toBe(null);
                } else if (scenario == 'update' && performed) {
                    expect(val).toEqual(updatedData);
                } else if (!performed) {
                    performed = true;
                    expect(typeof val).toEqual('object');
                    expect(val).toEqual(data);
                }
            });
            ref.set(data);
            if (scenario == 'remove') {
                ref.remove();
            } else if (scenario == 'update') {
                ref.set(updatedData);
            }
        });

        test(('should write string data') + ((scenario == 'remove') ? ' and remove data' : '') + ((scenario == 'update') ? ' and update data' : ''), async () => {
            let data = 'test';
            let updatedData = 'world_updated';
            let ref = app.database().ref('/test' + (scenario == 'update' ? '_update' : '')).child('string');
            let performed = false;
            ref.once('value', (snap) => {
                const val = snap.val();
                if (scenario == 'remove' && performed) {
                    expect(val).toBe(null);
                } else if (scenario == 'update' && performed) {
                    expect(val).toEqual(updatedData);
                } else if (!performed) {
                    performed = true;
                    expect(typeof val).toEqual('string');
                    expect(val).toEqual(data);
                }
            });
            ref.set(data);
            if (scenario == 'remove') {
                ref.remove();
            } else if (scenario == 'update') {
                ref.set(updatedData);
            }
        });


        test(('should write string data') + ((scenario == 'remove') ? ' and remove data' : '') + ((scenario == 'update') ? ' and update data' : ''), async () => {
            let data = 123;
            let updatedData = 456;
            let ref = app.database().ref('/test' + (scenario == 'update' ? '_update' : '')).child('number');
            let performed = false;
            ref.once('value', (snap) => {
                const val = snap.val();
                if (scenario == 'remove' && performed) {
                    expect(val).toBe(null);
                } else if (scenario == 'update' && performed) {
                    expect(val).toEqual(updatedData);
                } else if (!performed) {
                    performed = true;
                    expect(typeof val).toEqual('number');
                    expect(val).toEqual(data);
                }
            });
            ref.set(data);
            if (scenario == 'remove') {
                ref.remove();
            } else if (scenario == 'update') {
                ref.set(updatedData);
            }
        });

    }
});

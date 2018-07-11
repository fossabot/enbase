import {NodeVM, VMRequire, VMScript} from "vm2";
import {EntityRepository} from "../repositories/EntityRepository";
import {RuleDataSnapshot} from "./RuleDataSnapshot";
import {DatabaseAction} from "./types";

/**
 * Validate read, write or update
 */
export class SecurityChecker {
    private entityRepository: EntityRepository;
    private scriptsReference: object = {};

    constructor(entityRepository: EntityRepository) {
        this.entityRepository = entityRepository;
    }

    /**
     *
     * @param {string} rulesPath
     */
    public compile(rulesPath: string) {
        const rules: { rules: object } = require(rulesPath);
        this.compileReference("", rules.rules);
    }

    /**
     * @beta
     * @param {DatabaseAction} action
     * @param {string} path
     * @param {object | string | null} data
     * @param {object | null} auth
     * @returns {Promise<boolean>}
     */
    public async validate(action: DatabaseAction, path: string, data: object | string | null, auth: object | null) {
        if (action == DatabaseAction.READ) { return await this.tryRead(path.replace("/", ""), auth); }
        if (action == DatabaseAction.WRITE) { return await this.tryWrite(path.replace("/", ""), data, auth); }
        if (action == DatabaseAction.REMOVE) { return await this.tryRemove(path.replace("/", ""), auth); }
    }

    /**
     *
     * @param {string} key
     * @param {string} path
     * @param {object | string | null} data
     * @param {object | null} auth
     * @returns {Promise<boolean>}
     */
    private async verify(key: string, path: string, data: object | string | null, auth: object | null) {
        const self = this;
        const paths = path.split("/");
        let currentScriptsRef = this.scriptsReference;
        const variables = {};
        for (const pathElement of paths) {
            if (currentScriptsRef.hasOwnProperty(pathElement)) {
                currentScriptsRef = currentScriptsRef[pathElement];
            } else {
                const varKey = Object.keys(currentScriptsRef)[0];
                if (varKey.startsWith("$")) {
                    variables[varKey.replace("$", "")] = pathElement;
                }
                currentScriptsRef = currentScriptsRef[varKey];
            }
            if (currentScriptsRef.hasOwnProperty(key)) {
                const script = currentScriptsRef[key];
                const fetchVal = async (valPath) => {
                    return await self.entityRepository.read(valPath, auth, true);
                };
                const fetchChildren = async (childrenPath) => {
                    return Object.keys(await self.entityRepository.read(childrenPath, auth, true));
                };
                const sandbox = {
                    auth: auth,
                    newData: null,
                    now: new Date().getTime(),
                    data: new RuleDataSnapshot(path, fetchVal, fetchChildren),
                };
                if (key == ".write" || key == ".validate") {
                    sandbox.newData = new RuleDataSnapshot(path, async (path) => {
                        const elements = path.split("/");
                        let current: object | any | null = data || {};
                        for (const element of elements) {
                            if (current.hasOwnProperty(element)) {
                                current = current[element];
                            } else {
                                return current;
                            }
                        }
                    }, async (path) => {
                        const elements = path.split("/");
                        let current: object | any | null = data || {};
                        for (const element of elements) {
                            if (current.hasOwnProperty(element)) {
                                current = current[element];
                            } else {
                                return Object.keys(current);
                            }
                        }
                    });
                }
                const requireBox: VMRequire = {
                    mock: {
                        root: new RuleDataSnapshot("", fetchVal, fetchChildren),
                    },
                };
                for (const [key, value] of Object.entries(variables)) { sandbox["$" + key] = value; }
                const method = new NodeVM({sandbox, require: requireBox}).run(script);
                const status = await method();
                if (!status) { return false; }
            }
        }
        return true;
    }

    /**
     *
     * @param {string} path
     * @param {object | null} auth
     * @returns {Promise<boolean>}
     */
    private async tryRead(path: string, auth: object | null) {
        return await this.verify(".read", path, null, auth);
    }

    /**
     *
     * @param {string} path
     * @param {object | string} data
     * @param {object | null} auth
     * @returns {Promise<boolean>}
     */
    private async tryWrite(path: string, data: object | string, auth: object | null) {
        return (await this.verify(".validate", path, data, auth)) && (await this.verify(".write", path, data, auth));
    }

    /**
     *
     * @param {string} path
     * @param {object | null} auth
     * @returns {Promise<boolean>}
     */
    private async tryRemove(path: string, auth: object | null) {
        return await this.verify(".write", path, null, auth);
    }

    /**
     *
     * @param {string} path
     * @param {object} ref
     */
    private compileReference(path: string, ref: object) {
        for (const [key, value] of Object.entries(ref)) {
            if (value instanceof Object) {
                this.compileReference(`${path}/${key}`, value);
            } else {
                this.compileRuleset(`${path}`, key, ref);
            }
        }
    }

    /**
     *
     * @param {string} path
     * @returns {object}
     */
    private getScriptsReference(path: string) {
        const elements: any = path.split("/");
        let ref: object = this.scriptsReference;
        for (const element of elements) {
            if (!ref.hasOwnProperty(element)) {
                ref[element] = {};
            }
            ref = ref[element];
        }
        return ref;
    }

    /**
     *
     * @param {string} path
     * @param {string} key
     * @param {object} ruleset
     */
    private compileRuleset(path: string, key: string, ruleset: object) {
        const ref: object = this.getScriptsReference(path.replace("/", ""));
        const pattern = `const root = require('root'); module.exports = async () => `;
        const prepareRuleset = (ruleset) => {
            return ruleset
                .split("root")
                .join("await root")
                .split("data")
                .join("await data")
                .split("newData")
                .join("await newData")
                .split("contains")
                .join("includes")
                .split("beginsWith")
                .join("startsWith");
        };
        if (key == ".read") {
            ref[".read"] = new VMScript(pattern + prepareRuleset(ruleset[".read"]));
        }
        if (key == ".write") {
            ref[".write"] = new VMScript(pattern + prepareRuleset(ruleset[".write"]));
        }
        if (key == ".validate") {
            ref[".validate"] = new VMScript(pattern + prepareRuleset(ruleset[".validate"]));
        }
    }

}

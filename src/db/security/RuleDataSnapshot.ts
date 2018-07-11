/**
 * Represent data branch
 */
export class RuleDataSnapshot {
    private readonly path: string;
    private children: string[] = [];
    private value: object;
    private valueCallback: (path) => Promise<object>;
    private childrenCallback: (path) => Promise<string[]>;
    private isValueFetched = false;
    private isChildrenFetched = false;

    constructor(path: string, valueCallback: (path) => Promise<object>, childrenCallback: (path) => Promise<string[]>) {
        this.path = path;
        this.valueCallback = valueCallback;
        this.childrenCallback = childrenCallback;
    }

    public child(name: string) {
        return new RuleDataSnapshot(`${this.path}/${name}`, this.valueCallback, this.childrenCallback);
    }

    public parent() {
        const elements: string[] = this.path.split("/");
        elements.pop();
        const newPath = elements.join("/");
        return new RuleDataSnapshot(newPath, this.valueCallback, this.childrenCallback);
    }

    public async hasChild(name: string) {
        if (!this.isChildrenFetched) {
            this.isChildrenFetched = true;
            this.children = await this.childrenCallback(this.path);
        }
        return this.children.includes(name);
    }

    public async hasChildren(names: string[]) {
        let has = true;
        for (const name of names) { if (!await this.hasChild(name)) { has = false; } }
        return has;
    }

    public exists() {
        return this.val() != null;
    }

    public async fetchVal() {
        if (!this.isValueFetched) {
            this.isValueFetched = true;
            this.value = await this.valueCallback(this.path);
        }
    }

    public async val() {
        await this.fetchVal();
        return this.value;
    }

    public async isNumber() {
        await this.fetchVal();
        return typeof this.value == "number";
    }

    public async isString() {
        await this.fetchVal();
        return typeof this.value == "string";
    }

    public async isBoolean() {
        await this.fetchVal();
        return typeof this.value == "boolean";
    }

}

/**
 * Can be read
 */
export interface IRead {
    /**
     * Read single value on specific path reference
     * @param {string} path
     * @param skipPermissions
     * @returns {Promise<Object>}
     */
    read(path: string, auth: object | null, skipPermissions: boolean | null): Promise<Object>;
}

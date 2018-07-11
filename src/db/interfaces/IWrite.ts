/**
 * Can be written or updated
 */
export interface IWrite {
    /**
     * Set single value in database
     * @param {String} path
     * @param {Object} data
     * @param skipPermissions
     * @returns {Promise<Object>}
     */
    set(path: string, data: object, auth: object | null, skipPermissions: boolean | null): Promise<Object>;

    /**
     * Update single value in database
     * @param {String} path
     * @param {Object} data
     * @param skipPermissions
     * @returns {Promise<Object>}
     */
    update(path: string, data: object, auth: object | null, skipPermissions: Object | null): Promise<Object>;
}

/**
 * Create a new immutable ObjectId instance
 *
 * @class Represents the BSON ObjectId type
 * @param {String|Number} id Can be a 24 byte hex string, 12 byte binary string or a Number.
 * @return {Object} instance of ObjectId.
 */
export function ObjectId(id: string | number): any;
export class ObjectId {
    /**
     * Create a new immutable ObjectId instance
     *
     * @class Represents the BSON ObjectId type
     * @param {String|Number} id Can be a 24 byte hex string, 12 byte binary string or a Number.
     * @return {Object} instance of ObjectId.
     */
    constructor(id: string | number);
    _bsontype: string;
    id: string;
    toJSON: () => string;
    toString: () => string;
    toHexString: () => string;
    equals: (otherId: any) => boolean;
    getTimestamp: () => Date;
    generate: (time?: number) => string;
}
export namespace ObjectId {
    export let index: number;
    export { ObjectId as default };
    /**
     * Creates an ObjectId from a second based number, with the rest of the ObjectId zeroed out. Used for comparisons or sorting the ObjectId.
     *
     * @param {Number} time an integer number representing a number of seconds.
     * @return {ObjectId} return the created ObjectId
     * @api public
     */
    export function createFromTime(time: number): ObjectId;
    /**
     * Creates an ObjectId from a hex string representation of an ObjectId.
     *
     * @param {String} hexString create a ObjectId from a passed in 24 byte hexstring.
     * @return {ObjectId} return the created ObjectId
     * @api public
     */
    export function createFromHexString(hexString: string): ObjectId;
    /**
     * Checks if a value is a valid bson ObjectId
     *
     * @param {String} objectid Can be a 24 byte hex string or an instance of ObjectId.
     * @return {Boolean} return true if the value is a valid bson ObjectId, return false otherwise.
     * @api public
     *
     * THE NATIVE DOCUMENTATION ISN'T CLEAR ON THIS GUY!
     * http://mongodb.github.io/node-mongodb-native/api-bson-generated/objectid.html#objectid-isvalid
     */
    export function isValid(id: any): boolean;
}

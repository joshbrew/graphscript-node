
var MACHINE_ID = Math.floor(Math.random() * 0xFFFFFF);
var index = ObjectId.index = parseInt(Math.random() * 0xFFFFFF, 10);
var pid = (typeof process === 'undefined' || typeof process.pid !== 'number' ? Math.floor(Math.random() * 100000) : process.pid) % 0xFFFF;
// <https://github.com/williamkapke/bson-objectid/pull/51>
// Attempt to fallback Buffer if _Buffer is undefined (e.g. for Node.js).
// Worst case fallback to null and handle with null checking before using.
var BufferCtr = (() => { try { return _Buffer; }catch(_){ try{ return Buffer; }catch(_){ return null; } } })();

/**
 * Determine if an object is Buffer
 *
 * Author:   Feross Aboukhadijeh <feross@feross.org> <http://feross.org>
 * License:  MIT
 *
 */
var isBuffer = function (obj) {
  return !!(
  obj != null &&
  obj.constructor &&
  typeof obj.constructor.isBuffer === 'function' &&
  obj.constructor.isBuffer(obj)
  )
};

// Precomputed hex table enables speedy hex string conversion
var hexTable = [];
for (var i = 0; i < 256; i++) {
  hexTable[i] = (i <= 15 ? '0' : '') + i.toString(16);
}

// Regular expression that checks for hex value
var checkForHexRegExp = new RegExp('^[0-9a-fA-F]{24}$');

// Lookup tables
var decodeLookup = [];
i = 0;
while (i < 10) decodeLookup[0x30 + i] = i++;
while (i < 16) decodeLookup[0x41 - 10 + i] = decodeLookup[0x61 - 10 + i] = i++;

/**
 * Create a new immutable ObjectId instance
 *
 * @class Represents the BSON ObjectId type
 * @param {String|Number} id Can be a 24 byte hex string, 12 byte binary string or a Number.
 * @return {Object} instance of ObjectId.
 */
export function ObjectId(id) {
  if(!(this instanceof ObjectId)) return new ObjectId(id);
  if(id && ((id instanceof ObjectId) || id._bsontype==="ObjectId"))
    return id;

  this._bsontype = 'ObjectId';

  // The most common usecase (blank id, new objectId instance)
  if (id == null || typeof id === 'number') {
    // Generate a new id
    this.id = this.generate(id);
    // Return the object
    return;
  }

  // Check if the passed in id is valid
  var valid = ObjectId.isValid(id);

  // Throw an error if it's not a valid setup
  if (!valid && id != null) {
    throw new Error(
      'Argument passed in must be a single String of 12 bytes or a string of 24 hex characters'
    );
  } else if (valid && typeof id === 'string' && id.length === 24) {
    return ObjectId.createFromHexString(id);
  } else if (id != null && id.length === 12) {
    // assume 12 byte string
    this.id = id;
  } else if (id != null && typeof id.toHexString === 'function') {
    // Duck-typing to support ObjectId from different npm packages
    return id;
  } else {
    throw new Error(
      'Argument passed in must be a single String of 12 bytes or a string of 24 hex characters'
    );
  }
}

export default ObjectId;

/**
 * Creates an ObjectId from a second based number, with the rest of the ObjectId zeroed out. Used for comparisons or sorting the ObjectId.
 *
 * @param {Number} time an integer number representing a number of seconds.
 * @return {ObjectId} return the created ObjectId
 * @api public
 */
ObjectId.createFromTime = function(time){
  time = parseInt(time, 10) % 0xFFFFFFFF;
  return new ObjectId(hex(8,time)+"0000000000000000");
};

/**
 * Creates an ObjectId from a hex string representation of an ObjectId.
 *
 * @param {String} hexString create a ObjectId from a passed in 24 byte hexstring.
 * @return {ObjectId} return the created ObjectId
 * @api public
 */
ObjectId.createFromHexString = function(hexString) {
  // Throw an error if it's not a valid setup
  if (typeof hexString === 'undefined' || (hexString != null && hexString.length !== 24)) {
    throw new Error(
      'Argument passed in must be a single String of 12 bytes or a string of 24 hex characters'
    );
  }

  // Calculate lengths
  var data = '';
  var i = 0;

  while (i < 24) {
    data += String.fromCharCode((decodeLookup[hexString.charCodeAt(i++)] << 4) | decodeLookup[hexString.charCodeAt(i++)]);
  }

  return new ObjectId(data);
};

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
ObjectId.isValid = function(id) {
  if (id == null) return false;

  if (typeof id === 'number') {
    return true;
  }

  if (typeof id === 'string') {
    return id.length === 12 || (id.length === 24 && checkForHexRegExp.test(id));
  }

  if (id instanceof ObjectId) {
    return true;
  }

  // <https://github.com/williamkapke/bson-objectid/issues/53>
  if (isBuffer(id)) {
    return ObjectId.isValid(id.toString('hex'));
  }

  // Duck-Typing detection of ObjectId like objects
  // <https://github.com/williamkapke/bson-objectid/pull/51>
  if (typeof id.toHexString === 'function') {
    if(
      BufferCtr &&
      (id.id instanceof BufferCtr || typeof id.id === 'string')
    ) {
      return id.id.length === 12 || (id.id.length === 24 && checkForHexRegExp.test(id.id));
    }
  }

  return false;
};

ObjectId.prototype = {
  constructor: ObjectId,

  /**
   * Return the ObjectId id as a 24 byte hex string representation
   *
   * @return {String} return the 24 byte hex string representation.
   * @api public
   */
  toHexString: function() {
    if (!this.id || !this.id.length) {
      throw new Error(
        'invalid ObjectId, ObjectId.id must be either a string or a Buffer, but is [' +
          JSON.stringify(this.id) +
          ']'
      );
    }

    if (this.id.length === 24) {
      return this.id;
    }

    if (isBuffer(this.id)) {
      return this.id.toString('hex')
    }

    var hexString = '';
    for (var i = 0; i < this.id.length; i++) {
      hexString += hexTable[this.id.charCodeAt(i)];
    }

    return hexString;
  },

  /**
   * Compares the equality of this ObjectId with `otherID`.
   *
   * @param {Object} otherId ObjectId instance to compare against.
   * @return {Boolean} the result of comparing two ObjectId's
   * @api public
   */
  equals: function (otherId){
    if (otherId instanceof ObjectId) {
      return this.toString() === otherId.toString();
    } else if (
      typeof otherId === 'string' &&
      ObjectId.isValid(otherId) &&
      otherId.length === 12 &&
      isBuffer(this.id)
    ) {
      return otherId === this.id.toString('binary');
    } else if (typeof otherId === 'string' && ObjectId.isValid(otherId) && otherId.length === 24) {
      return otherId.toLowerCase() === this.toHexString();
    } else if (typeof otherId === 'string' && ObjectId.isValid(otherId) && otherId.length === 12) {
      return otherId === this.id;
    } else if (otherId != null && (otherId instanceof ObjectId || otherId.toHexString)) {
      return otherId.toHexString() === this.toHexString();
    } else {
      return false;
    }
  },

  /**
   * Returns the generation date (accurate up to the second) that this ID was generated.
   *
   * @return {Date} the generation date
   * @api public
   */
  getTimestamp: function(){
    var timestamp = new Date();
    var time;
    if (isBuffer(this.id)) {
      time = this.id[3] | (this.id[2] << 8) | (this.id[1] << 16) | (this.id[0] << 24);
    } else {
      time = this.id.charCodeAt(3) | (this.id.charCodeAt(2) << 8) | (this.id.charCodeAt(1) << 16) | (this.id.charCodeAt(0) << 24);
    }
    timestamp.setTime(Math.floor(time) * 1000);
    return timestamp;
  },

  /**
  * Generate a 12 byte id buffer used in ObjectId's
  *
  * @method
  * @param {number} [time] optional parameter allowing to pass in a second based timestamp.
  * @return {string} return the 12 byte id buffer string.
  */
  generate: function (time) {
    if ('number' !== typeof time) {
      time = ~~(Date.now() / 1000);
    }

    //keep it in the ring!
    time = parseInt(time, 10) % 0xFFFFFFFF;

    var inc = next();

    return String.fromCharCode(
      ((time >> 24) & 0xFF),
      ((time >> 16) & 0xFF),
      ((time >> 8) & 0xFF),
      (time & 0xFF),
      ((MACHINE_ID >> 16) & 0xFF),
      ((MACHINE_ID >> 8) & 0xFF),
      (MACHINE_ID & 0xFF),
      ((pid >> 8) & 0xFF),
      (pid & 0xFF),
      ((inc >> 16) & 0xFF),
      ((inc >> 8) & 0xFF),
      (inc & 0xFF)
    )
  },
};

function next() {
  return index = (index+1) % 0xFFFFFF;
}

function hex(length, n) {
  n = n.toString(16);
  return (n.length===length)? n : "00000000".substring(n.length, length) + n;
}

function buffer(str) {
  var i=0,out=[];

  if(str.length===24)
    for(;i<24; out.push(parseInt(str[i]+str[i+1], 16)),i+=2);

  else if(str.length===12)
    for(;i<12; out.push(str.charCodeAt(i)),i++);

  return out;
}

var inspect = (Symbol && Symbol.for && Symbol.for('nodejs.util.inspect.custom')) || 'inspect';

/**
 * Converts to a string representation of this Id.
 *
 * @return {String} return the 24 byte hex string representation.
 * @api private
 */
ObjectId.prototype[inspect] = function() { return "ObjectId("+this+")" };
ObjectId.prototype.toJSON = ObjectId.prototype.toHexString;
ObjectId.prototype.toString = ObjectId.prototype.toHexString;

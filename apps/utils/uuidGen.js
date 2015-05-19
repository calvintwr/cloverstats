var intformat = require('biguint-format'),
    flakeId = require('flake-idgen');

function uuidGen(prefix) {
    /* intformant and flake is for generating UUID-like filenames for images */
    prefix = prefix || '';
    
    var flakeIdGen = new flakeId();

    return intformat(flakeIdGen.next(), 'hex', { prefix: prefix });
}

module.exports = uuidGen;

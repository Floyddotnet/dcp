/* global beforeEach, describe, it */
'use strict';

var assert = require('assert');

var _ = require('lodash');

var dcp = require('../');

beforeEach(function() {
  dcp.clean();
});

describe('#define', function() {

  it('should define new clone function', function() {
    var obj = {
      a: 1
    };
    var clone = dcp.define('test', obj);
    assert.strictEqual(typeof clone, 'function');
    var newObj = clone(obj);
    assert.deepEqual(newObj, obj);
    assert.notStrictEqual(newObj, obj);
  });
});

describe('#clone', function() {

  it('should return string', function() {
    var str = 'test';
    var newStr = dcp.clone('test', str);
    assert.strictEqual(str, newStr);
  });

  it('should copy deeply', function() {
    var structure = {
      a: 1,
      b: [1, 2],
      c: { c1: 1, c2: '2'},
      d: { d1: { d11: 'test', d12: { d123: true } } }
    };
    var obj = {
      a: 2,
      b: [3, 4],
      c: { c1: 2, c2: '2'},
      d: { d1: { d11: 'tes', d12: { d123: false } } }
    };
    var clone = dcp.define('test', structure);
    var newObj = clone(obj);
    assert.deepEqual(newObj, obj);
    assert.notStrictEqual(newObj, obj);
    obj.d.d11 = 'test2';
    assert.notDeepEqual(newObj, obj);
  });

  it('should copy deep array', function() {
    var obj = [
      1,
      [
        [1, '2', true, false, function() {}]
      ],
      [4, { d: { d1: function() {}}}, [5, { e: [false] } ] ]
    ];
    var clone = dcp.define('test', obj);
    var newObj = clone(obj);
    assert.deepEqual(newObj, obj);
    assert.notStrictEqual(newObj, obj);
  });

  it('should copy deep object', function() {
    var count = 10;
    var obj = _.mapValues(_.times(count), function(num) {
      return _.mapValues(_.times(num), function(num) {
        return _.mapValues(_.times(num));
      });
    });
    var clone = dcp.define('test', obj);
    var newObj = clone(obj);
    assert.deepEqual(newObj, obj);
    assert.notStrictEqual(newObj, obj);
  });

  it('should get clone function', function() {
    var obj = {
      a: {},
      b: [],
      c: [{}, { c1: { c2: {} } }],
      d: false
    };
    dcp.define('test', obj);
    var func = dcp.clone('test');
    assert.strictEqual(typeof func, 'function');
    var newObj = func(obj);
    assert.deepEqual(newObj, obj);
    assert.notStrictEqual(newObj, obj);
  });

  it('should get default value', function() {
    var structure = {
      a: 1,
      b: 2,
      c: 3
    };
    var obj = {
      a: 5,
      c: 5
    };
    var clone = dcp.define('test', structure);
    var newObj = clone(obj);
    assert.deepEqual(newObj, {
      a: 5,
      b: 0,
      c: 5
    });
    assert.notStrictEqual(newObj, obj);
  });

  it('should make default values', function() {
    var structure = {
      a: 1,
      b: 'default',
      c: [undefined, { c1: [{}, { c12: false }] }],
      d: { d1: true }
    };
    var obj = {
      a: 10,
      c: [1],
      d: {}
    };
    dcp.define('test', structure);
    var newObj = dcp.clone('test', obj);
    assert.deepEqual(newObj, {
      a: 10,
      b: '',
      c: [1, { c1: [{}, { c12: false }] }],
      d: { d1: false }
    });
    assert.notStrictEqual(structure.d, obj.d);
    assert.notStrictEqual(structure.d, newObj.d);
    assert.notStrictEqual(obj.d, newObj.d);
  });

  it('should make clone', function() {
    var structure = {
      a: 1,
      b: 'default',
      c: [undefined, { c1: [{}, { c12: false }] }],
      d: { d1: true }
    };
    var clone = dcp.define('test', structure);
    var newObj = clone();
    assert.deepEqual(newObj, {
      a: 0,
      b: '',
      c: [undefined, { c1: [{}, { c12: false }] }],
      d: { d1: false }
    });
    assert.notStrictEqual(newObj, structure);
  });

  it('should not cause an error even if an object has circular structure', function() {
    var obj = {
      a: 1
    };
    var obj2 = {
      a: 2,
      b: obj
    };
    obj.b = obj2;
    var clone = dcp.define('test', obj);
    var newObj = clone(obj);
    assert.deepEqual(newObj, obj);
    assert.notStrictEqual(newObj.b, obj.b);
    assert.notStrictEqual(newObj.b.b, obj.b.b);
  });

  it('should copy multi circular structure', function() {
    var obj1 = {
      a: 1
    };
    var obj2 = {
      a: 2,
      b: obj1
    };
    var obj3 = {
      a: 3,
      b: obj2
    };
    obj1.b = obj2;
    obj1.c = obj3;
    obj2.c = obj3;
    obj3.c = obj1;
    var clone = dcp.define('test', obj1);
    var newObj = clone(obj1);
    assert.deepEqual(newObj, obj1);
    assert.notStrictEqual(newObj.b, obj1.b);
    assert.notStrictEqual(newObj.b.b, obj1.b.b);
  });

  it('should copy class', function() {
    var Test = function(str) {
      this._str = str;
    };
    Test.prototype.get = function() {
      return this._str;
    };
    Test.prototype.set = function(str) {
      this._str = str;
      return this;
    };
    var test = new Test('test');
    var newObj = dcp.clone('test', test);
    assert.deepEqual(newObj, test);
    assert.strictEqual(newObj.__proto__, test.__proto__);
    assert.notStrictEqual(newObj, test);
    assert.notStrictEqual(newObj, test);
    assert.strictEqual(newObj.get(), test.get());
    assert.strictEqual(newObj.set('test2').get(), test.set('test2').get());
  });

});

describe('#shallow', function() {

  it('should copy shallowly', function() {
    var obj = {
      a: 1,
      b: 'default',
      c: [undefined, { c1: [{}, { c12: false }] }],
      d: { d1: true }
    };
    dcp.define('test', obj);
    var clone = dcp.shallow('test');
    var newObj = clone(obj);
    assert.deepEqual(newObj, obj);
    assert.notStrictEqual(newObj, obj);
    assert.strictEqual(newObj.c, obj.c);
  });
});

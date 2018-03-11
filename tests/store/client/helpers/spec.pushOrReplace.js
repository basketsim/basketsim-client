import {assert} from 'chai';
import pushOrReplace from './../../../../app_modules/store/client/helpers/pushOrReplace';

describe('pushOrReplace', function() {
    it('Should replace item if same id and push the rest', test1);
    it('Should replace item if same id and push the rest - no nested id', test2);
    it('Should just push if none are similar', test3);
    it('Should only merge if both are similar', test4);
});

function test1() {
    const initialList = [{
        _id: { _str: 'aaa'},
        b: 10,
        c: 100
    }, {
        _id: { _str: 'bbb'},
        b: 20,
        c: 200
    }];
    const newList = [{
        _id: { _str: 'aaa'},
        b: 1,
        c: 1
    }, {
        _id: { _str: 'ddd'},
        b: 4,
        c: 4
    }];
    const expected = [{
        _id: { _str: 'bbb'},
        b: 20,
        c: 200
    }, {
        _id: { _str: 'aaa'},
        b: 1,
        c: 1
    }, {
        _id: { _str: 'ddd'},
        b: 4,
        c: 4
    }];
    const key = '_id._str';
    const actual = pushOrReplace(initialList, newList, key);
    assert.deepEqual(expected, actual);
}
function test2() {
    const initialList = [{
        _str: 'aaa',
        b: 10,
        c: 100
    }, {
        _str: 'bbb',
        b: 20,
        c: 200
    }];
    const newList = [{
            _str: 'aaa',
        b: 1,
        c: 1
    }, {
        _str: 'ddd',
        b: 4,
        c: 4
    }];
    const expected = [{
        _str: 'bbb',
        b: 20,
        c: 200
    }, {
        _str: 'aaa',
        b: 1,
        c: 1
    }, {
        _str: 'ddd',
        b: 4,
        c: 4
    }];
    const key = '_str';
    const actual = pushOrReplace(initialList, newList, key);
    assert.deepEqual(expected, actual);
}
function test3() {
    const list = [{id:1, a:1}, {id:2, a:2}];
    const newList = [{id:3, a:1}, {id:4, a:2}];
    const expected = [{id:1, a:1}, {id:2, a:2}, {id:3, a:1}, {id:4, a:2}];
    const actual = pushOrReplace(list, newList, 'id');
    assert.deepEqual(actual, expected);
}
function test4() {
    const list = [{id:1, a:1}, {id:2, a:2}];
    const newList = [{id:1, a:10}, {id:2, a:20}];
    const expected = newList;
    const actual = pushOrReplace(list, newList, 'id');
    assert.deepEqual(actual, expected);
}
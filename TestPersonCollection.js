/**
 * Created by bert on 09.05.15.
 */
///<reference path="references.d.ts"/>
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var TestPerson = require("./TestPerson");
var BaseCollection = require("./BaseCollection");
var TestPersonCollection = (function (_super) {
    __extends(TestPersonCollection, _super);
    function TestPersonCollection() {
        _super.call(this, TestPerson);
    }
    return TestPersonCollection;
})(BaseCollection);
module.exports = TestPersonCollection;
//# sourceMappingURL=TestPersonCollection.js.map
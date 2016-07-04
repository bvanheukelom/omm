"use strict";
var SubObjectPath_1 = require("./SubObjectPath");
var Serializer_1 = require("./Serializer");
var LocalObjectRetriever = (function () {
    function LocalObjectRetriever() {
    }
    LocalObjectRetriever.prototype.setQuietProperty = function (obj, propertyName, value) {
        if (!Object.getOwnPropertyDescriptor(obj, propertyName)) {
            Object.defineProperty(obj, propertyName, {
                configurable: false,
                enumerable: false,
                writable: true
            });
        }
        obj[propertyName] = value;
    };
    LocalObjectRetriever.prototype.getId = function (o) {
        var p = o["localPath"];
        return p;
    };
    LocalObjectRetriever.prototype.getObject = function (s, parentObject, propertyName) {
        var subObjectPath = new SubObjectPath_1.default(s);
        return Promise.resolve(subObjectPath.getSubObject(parentObject["rootObject"]));
    };
    LocalObjectRetriever.prototype.preToDocument = function (o) {
        var that = this;
        // Serializer.forEachTypedObject(o, function(path:SubObjectPath, subO:Object){
        //     that.setQuietProperty(subO,"localPath",path.toString());
        // });
    };
    LocalObjectRetriever.prototype.postToObject = function (o) {
        var that = this;
        Serializer_1.default.forEachTypedObject(o, function (path, subO) {
            that.setQuietProperty(subO, "rootObject", o);
        });
    };
    return LocalObjectRetriever;
}());
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = LocalObjectRetriever;
//# sourceMappingURL=LocalObjectRetriever.js.map
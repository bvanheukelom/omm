/// <reference path="./TypeClass.ts"/>
/// <reference path="../../../../typings/node/node.d.ts"/>
var omm;
(function (omm) {
    omm.entityClasses;
    function Entity(p1) {
        if (typeof p1 == "string") {
            return function (target) {
                var typeClass = target;
                Reflect.defineMetadata("persistence:collectionName", p1, typeClass);
                Reflect.defineMetadata("persistence:entity", true, typeClass);
                omm.entityClasses[className(typeClass)] = typeClass;
            };
        }
        if (typeof p1 == "boolean") {
            return function (target) {
                var typeClass = target;
                if (p1)
                    Reflect.defineMetadata("persistence:collectionName", className(typeClass), typeClass);
                Reflect.defineMetadata("persistence:entity", true, typeClass);
                omm.entityClasses[className(typeClass)] = typeClass;
            };
        }
        else if (typeof p1 == "function") {
            var typeClass = p1;
            Reflect.defineMetadata("persistence:entity", true, typeClass);
            omm.entityClasses[className(typeClass)] = typeClass;
        }
    }
    omm.Entity = Entity;
    function Wrap(t, functionName, objectDescriptor) {
        Reflect.defineMetadata("persistence:wrap", true, t[functionName]);
    }
    omm.Wrap = Wrap;
    function ArrayOrMap(typeClassName) {
        return function (targetPrototypeObject, propertyName) {
            PersistenceAnnotation.setPropertyProperty(targetPrototypeObject, propertyName, "type", typeClassName);
            PersistenceAnnotation.setPropertyProperty(targetPrototypeObject, propertyName, "arrayOrMap", true);
        };
    }
    omm.ArrayOrMap = ArrayOrMap;
    function AsForeignKeys(targetPrototypeObject, propertyName) {
        return PersistenceAnnotation.setPropertyProperty(targetPrototypeObject, propertyName, "askeys", true);
    }
    omm.AsForeignKeys = AsForeignKeys;
    function Ignore(targetPrototypeObject, propertyName) {
        return PersistenceAnnotation.setPropertyProperty(targetPrototypeObject, propertyName, "ignore", true);
    }
    omm.Ignore = Ignore;
    function AsForeignKey(targetPrototypeObject, propertyName) {
        return AsForeignKeys(targetPrototypeObject, propertyName);
    }
    omm.AsForeignKey = AsForeignKey;
    function Type(typeClassName) {
        return function (targetPrototypeObject, propertyName) {
            PersistenceAnnotation.setPropertyProperty(targetPrototypeObject, propertyName, "type", typeClassName);
        };
    }
    omm.Type = Type;
    function className(fun) {
        var ret = fun.toString();
        ret = ret.substr('function '.length);
        ret = ret.substr(0, ret.indexOf('('));
        return ret;
    }
    omm.className = className;
    var PersistenceAnnotation = (function () {
        function PersistenceAnnotation() {
        }
        PersistenceAnnotation.getClass = function (o) {
            if (o)
                return o.constructor;
            else
                return undefined;
        };
        PersistenceAnnotation.getEntityClassByName = function (className) {
            return omm.entityClasses[className];
        };
        PersistenceAnnotation.getCollectionClasses = function () {
            var result = [];
            for (var i in omm.entityClasses) {
                var entityClass = omm.entityClasses[i];
                if (PersistenceAnnotation.getCollectionName(entityClass))
                    result.push(entityClass);
            }
            return result;
        };
        PersistenceAnnotation.getEntityClasses = function () {
            var result = [];
            for (var i in omm.entityClasses) {
                var entityClass = omm.entityClasses[i];
                result.push(entityClass);
            }
            return result;
        };
        PersistenceAnnotation.getCollectionName = function (f) {
            return Reflect.getMetadata("persistence:collectionName", f);
        };
        PersistenceAnnotation.isRootEntity = function (f) {
            return !!PersistenceAnnotation.getCollectionName(f);
        };
        PersistenceAnnotation.isEntity = function (f) {
            return !!omm.entityClasses[className(f)];
        };
        PersistenceAnnotation.isArrayOrMap = function (typeClass, propertyName) {
            return PersistenceAnnotation.getPropertyProperty(typeClass.prototype, propertyName, "arrayOrMap") == true;
        };
        PersistenceAnnotation.getPropertyClass = function (f, propertyName) {
            var className = PersistenceAnnotation.getPropertyProperty(f.prototype, propertyName, "type");
            if (!className)
                return undefined;
            else
                return PersistenceAnnotation.getEntityClassByName(className);
        };
        PersistenceAnnotation.getTypedPropertyNames = function (f) {
            var result = [];
            var props = Reflect.getMetadata("persistence:typedproperties", f.prototype);
            for (var i in props) {
                if (PersistenceAnnotation.getPropertyClass(f, i))
                    result.push(i);
            }
            return result;
        };
        PersistenceAnnotation.setPropertyProperty = function (targetPrototypeObject, propertyName, property, value) {
            var arr = Reflect.getMetadata("persistence:typedproperties", targetPrototypeObject);
            if (!arr) {
                arr = {};
                Reflect.defineMetadata("persistence:typedproperties", arr, targetPrototypeObject);
            }
            var propProps = arr[propertyName];
            if (!propProps) {
                propProps = {};
                arr[propertyName] = propProps;
            }
            propProps[property] = value;
        };
        PersistenceAnnotation.getPropertyProperty = function (targetPrototypeObject, propertyName, propertyProperty) {
            var arr = Reflect.getMetadata("persistence:typedproperties", targetPrototypeObject);
            if (arr && arr[propertyName]) {
                return arr[propertyName][propertyProperty];
            }
            return undefined;
        };
        PersistenceAnnotation.isStoredAsForeignKeys = function (typeClass, propertyName) {
            return PersistenceAnnotation.getPropertyProperty(typeClass.prototype, propertyName, "askeys");
        };
        PersistenceAnnotation.isIgnored = function (typeClass, propertyName) {
            return PersistenceAnnotation.getPropertyProperty(typeClass.prototype, propertyName, "ignore");
        };
        PersistenceAnnotation.getWrappedFunctionNames = function (f) {
            return PersistenceAnnotation.getPropertyNamesByMetaData(f.prototype, "persistence:wrap");
        };
        PersistenceAnnotation.getPropertyNamesByMetaData = function (o, metaData) {
            var result = [];
            for (var i in o) {
                var value = o[i];
                if (typeof value == "function" && Reflect.getMetadata(metaData, value))
                    result.push(i);
            }
            return result;
        };
        return PersistenceAnnotation;
    })();
    omm.PersistenceAnnotation = PersistenceAnnotation;
})(omm || (omm = {}));
if (typeof global != "undefined") {
    if (!global["entityClasses"])
        global["entityClasses"] = {};
    omm.entityClasses = global["entityClasses"];
}
else if (typeof window != "undefined") {
    if (!window["entityClasses"])
        window["entityClasses"] = {};
    omm.entityClasses = window["entityClasses"];
}
else
    omm.entityClasses = {};
var omm;
(function (omm) {
    var ConstantObjectRetriever = (function () {
        function ConstantObjectRetriever(o) {
            this.value = o;
        }
        ConstantObjectRetriever.prototype.getId = function (o) {
            return "constant";
        };
        ConstantObjectRetriever.prototype.getObject = function (s) {
            return this.value;
        };
        ConstantObjectRetriever.prototype.preToDocument = function (o) { };
        ConstantObjectRetriever.prototype.postToObject = function (o) { };
        return ConstantObjectRetriever;
    })();
    omm.ConstantObjectRetriever = ConstantObjectRetriever;
})(omm || (omm = {}));
var omm;
(function (omm) {
    var SubObjectPath = (function () {
        function SubObjectPath(s) {
            this.path = s || "";
        }
        SubObjectPath.prototype.clone = function () {
            return new SubObjectPath(this.path);
        };
        SubObjectPath.prototype.forEachPathEntry = function (iterator) {
            if (this.path.length > 0)
                this.path.split(".").forEach(function (entry) {
                    var propertyName = entry;
                    var id = undefined;
                    if (entry.indexOf("|") != -1) {
                        propertyName = entry.split("|")[0];
                        id = entry.split("|")[1];
                    }
                    iterator(propertyName, id);
                });
        };
        SubObjectPath.prototype.getSubObject = function (rootObject) {
            var o = rootObject;
            this.forEachPathEntry(function (propertyName, id) {
                if (typeof o != "undefined") {
                    o = o[propertyName];
                    if (typeof o != "undefined" && typeof id != "undefined") {
                        var foundEntry = false;
                        for (var j in o) {
                            var arrayEntry = o[j];
                            if (arrayEntry.getId() == id) {
                                o = arrayEntry;
                                foundEntry = true;
                                break;
                            }
                        }
                        if (!foundEntry)
                            o = undefined;
                    }
                }
            });
            return o;
        };
        SubObjectPath.prototype.appendArrayOrMapLookup = function (name, id) {
            if (this.path.length > 0)
                this.path += ".";
            this.path += name + "|" + id;
        };
        SubObjectPath.prototype.appendPropertyLookup = function (name) {
            if (this.path.length > 0)
                this.path += ".";
            this.path += name;
        };
        SubObjectPath.prototype.toString = function () {
            return this.path;
        };
        return SubObjectPath;
    })();
    omm.SubObjectPath = SubObjectPath;
})(omm || (omm = {}));
///<reference path="../annotations/PersistenceAnnotation.ts"/>
///<reference path="../annotations/TypeClass.ts"/>
///<reference path="./Document.ts"/>
///<reference path="./SubObjectPath.ts"/>
var omm;
(function (omm) {
    var Serializer = (function () {
        function Serializer(retri) {
            this.objectRetriever = retri;
        }
        Serializer.init = function () {
            omm.PersistenceAnnotation.getEntityClasses().forEach(function (c) {
                Serializer.installLazyLoaderGetterSetters(c);
            });
        };
        Serializer.installLazyLoaderGetterSetters = function (c) {
            omm.PersistenceAnnotation.getTypedPropertyNames(c).forEach(function (propertyName) {
                if (omm.PersistenceAnnotation.isStoredAsForeignKeys(c, propertyName)) {
                    var propertyDescriptor = Object.getOwnPropertyDescriptor(c.prototype, propertyName);
                    Object.defineProperty(c.prototype, propertyName, {
                        get: function () {
                            var v;
                            if (propertyDescriptor && propertyDescriptor.get)
                                v = propertyDescriptor.get.apply(this);
                            else
                                v = this["_" + propertyName];
                            if (Serializer.needsLazyLoading(this, propertyName)) {
                                var objectRetriever = this._objectRetriever;
                                if (typeof v == "string") {
                                    v = objectRetriever.getObject(v, this, propertyName);
                                    this[propertyName] = v;
                                }
                                else {
                                    for (var i in v) {
                                        var ele = v[i];
                                        v[i] = objectRetriever.getObject(ele, this, propertyName);
                                    }
                                }
                            }
                            return v;
                        },
                        set: function (v) {
                            //console.log("Monkey patched setter " + propertyName + " v:" + v);
                            if (propertyDescriptor && propertyDescriptor.set)
                                propertyDescriptor.set.apply(this, arguments);
                            else {
                                if (!Object.getOwnPropertyDescriptor(this, "_" + propertyName)) {
                                    Object.defineProperty(this, "_" + propertyName, {
                                        configurable: false,
                                        enumerable: false,
                                        writable: true
                                    });
                                }
                                this["_" + propertyName] = v;
                            }
                        },
                        configurable: propertyDescriptor ? propertyDescriptor.configurable : true,
                        enumerable: propertyDescriptor ? propertyDescriptor.enumerable : true
                    });
                }
                else {
                }
            });
        };
        Serializer.forEachTypedObject = function (object, cb) {
            this.forEachTypedObjectRecursive(object, object, new omm.SubObjectPath(), [], cb);
        };
        Serializer.forEachTypedObjectRecursive = function (rootObject, object, path, visited, cb) {
            var that = this;
            if (visited.indexOf(object) != -1)
                return;
            if (!object || typeof object != "object")
                return;
            visited.push(object);
            cb(path, object);
            var objectClass = omm.PersistenceAnnotation.getClass(object);
            omm.PersistenceAnnotation.getTypedPropertyNames(objectClass).forEach(function (typedPropertyName) {
                if (!omm.PersistenceAnnotation.isStoredAsForeignKeys(objectClass, typedPropertyName)) {
                    var v = object[typedPropertyName];
                    if (v) {
                        if (omm.PersistenceAnnotation.isArrayOrMap(objectClass, typedPropertyName)) {
                            for (var i in v) {
                                var e = v[i];
                                var subObjectPath = path.clone();
                                if (e.getId && e.getId()) {
                                    subObjectPath.appendArrayOrMapLookup(typedPropertyName, e.getId());
                                }
                                else {
                                    subObjectPath.appendArrayOrMapLookup(typedPropertyName, i);
                                }
                                cb(subObjectPath, e);
                                that.forEachTypedObjectRecursive(rootObject, e, subObjectPath, visited, cb);
                            }
                        }
                        else {
                            var subObjectPath = path.clone();
                            subObjectPath.appendPropertyLookup(typedPropertyName);
                            cb(subObjectPath, v);
                            that.forEachTypedObjectRecursive(rootObject, v, subObjectPath, visited, cb);
                        }
                    }
                }
            });
        };
        Serializer.setNonEnumerablePropertyProperty = function (obj, propertyName, value) {
            if (!Object.getOwnPropertyDescriptor(obj, propertyName)) {
                Object.defineProperty(obj, propertyName, {
                    configurable: false,
                    enumerable: false,
                    writable: true
                });
            }
            obj[propertyName] = value;
        };
        Serializer.needsLazyLoading = function (object, propertyName) {
            var oc = omm.PersistenceAnnotation.getClass(object);
            if (omm.PersistenceAnnotation.isStoredAsForeignKeys(oc, propertyName)) {
                var shadowpropertyDescriptor = Object.getOwnPropertyDescriptor(object, "_" + propertyName);
                var shadowPropertyIsKeys = false;
                if (shadowpropertyDescriptor)
                    if (typeof object["_" + propertyName] == "string")
                        shadowPropertyIsKeys = true;
                    else if (omm.PersistenceAnnotation.isArrayOrMap(oc, propertyName)) {
                        var v = object["_" + propertyName];
                        for (var i in v) {
                            if (typeof v[i] == "string")
                                shadowPropertyIsKeys = true;
                            break;
                        }
                    }
                return shadowPropertyIsKeys;
            }
            else
                return false;
        };
        Serializer.prototype.toObject = function (doc, f) {
            var o = this.toObjectRecursive(doc, f);
            this.objectRetriever.postToObject(o);
            return o;
        };
        Serializer.prototype.toObjectRecursive = function (doc, f) {
            var o;
            if (typeof doc == "function")
                throw new Error("Error in 'toObject'. doc is a function.");
            if (typeof f["toObject"] == "function") {
                o = f["toObject"](doc);
            }
            else {
                if (doc.className)
                    f = omm.PersistenceAnnotation.getEntityClassByName(doc.className);
                o = Object.create(f.prototype);
                for (var propertyName in doc) {
                    var value = doc[propertyName];
                    var propertyClass = omm.PersistenceAnnotation.getPropertyClass(f, propertyName);
                    var isStoredAsKeys = omm.PersistenceAnnotation.isStoredAsForeignKeys(f, propertyName);
                    if (propertyClass && !isStoredAsKeys) {
                        if (omm.PersistenceAnnotation.isArrayOrMap(f, propertyName)) {
                            var result = Array.isArray(value) ? [] : {};
                            for (var i in value) {
                                var entry = value[i];
                                entry = this.toObjectRecursive(entry, propertyClass);
                                result[i] = entry;
                            }
                            o[propertyName] = result;
                        }
                        else {
                            o[propertyName] = this.toObjectRecursive(value, propertyClass);
                        }
                    }
                    else {
                        o[propertyName] = value;
                    }
                }
            }
            omm.Serializer.setNonEnumerablePropertyProperty(o, "_objectRetriever", this.objectRetriever);
            return o;
        };
        Serializer.prototype.toDocument = function (object) {
            this.objectRetriever.preToDocument(object);
            return this.toDocumentRecursive(object);
        };
        Serializer.prototype.toDocumentRecursive = function (object, rootClass, parentObject, propertyNameOnParentObject) {
            var result;
            if (typeof object == "string" || typeof object == "number" || typeof object == "date" || typeof object == "boolean")
                result = object;
            else {
                var objectClass = omm.PersistenceAnnotation.getClass(object);
                if (typeof objectClass.toDocument == "function") {
                    result = objectClass.toDocument(object);
                }
                else {
                    var parentClass = omm.PersistenceAnnotation.getClass(parentObject);
                    if (parentObject && propertyNameOnParentObject && omm.PersistenceAnnotation.isStoredAsForeignKeys(parentClass, propertyNameOnParentObject)) {
                        return this.objectRetriever.getId(object);
                    }
                    else {
                        result = this.createDocument(object, rootClass ? rootClass : omm.PersistenceAnnotation.getClass(object), parentObject, propertyNameOnParentObject);
                        if (parentClass && objectClass != omm.PersistenceAnnotation.getPropertyClass(parentClass, propertyNameOnParentObject))
                            result.className = omm.className(objectClass);
                    }
                }
            }
            return result;
        };
        Serializer.prototype.createDocument = function (object, rootClass, parentObject, propertyNameOnParentObject) {
            var doc = {};
            var objectClass = omm.PersistenceAnnotation.getClass(object);
            for (var property in object) {
                var value = object[property];
                if (value !== undefined && !omm.PersistenceAnnotation.isIgnored(objectClass, property)) {
                    if (omm.PersistenceAnnotation.getPropertyClass(objectClass, property)) {
                        if (omm.PersistenceAnnotation.isArrayOrMap(objectClass, property)) {
                            var result;
                            if (Array.isArray(value))
                                result = [];
                            else
                                result = {};
                            for (var i in value) {
                                var subObject = value[i];
                                result[i] = this.toDocumentRecursive(subObject, rootClass, object, property);
                            }
                            doc[property] = result;
                        }
                        else if (typeof object[property] == 'object') {
                            doc[property] = this.toDocumentRecursive(value, rootClass, object, property);
                        }
                        else {
                            throw new Error("Unsupported type : " + typeof value);
                        }
                    }
                    else if (typeof value == 'function') {
                    }
                    else {
                        doc[property] = value;
                    }
                }
            }
            return doc;
        };
        return Serializer;
    })();
    omm.Serializer = Serializer;
})(omm || (omm = {}));
/**
 * Created by bert on 04.05.15.
 */
///<reference path="./Document.ts"/>
///<reference path="../annotations/PersistenceAnnotation.ts"/>
///<reference path="../annotations/TypeClass.ts"/>
///<reference path="./Document.ts"/>
///<reference path="./Serializer.ts"/>
///<reference path="./ObjectRetriever.ts"/>
///<reference path="./Persistable.ts"/>
var omm;
(function (omm) {
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
            var subObjectPath = new omm.SubObjectPath(s);
            return subObjectPath.getSubObject(parentObject["rootObject"]);
        };
        LocalObjectRetriever.prototype.preToDocument = function (o) {
            var that = this;
            omm.Serializer.forEachTypedObject(o, function (path, subO) {
                that.setQuietProperty(subO, "localPath", path.toString());
            });
        };
        LocalObjectRetriever.prototype.postToObject = function (o) {
            var that = this;
            omm.Serializer.forEachTypedObject(o, function (path, o) {
                that.setQuietProperty(o, "rootObject", o);
            });
        };
        return LocalObjectRetriever;
    })();
    omm.LocalObjectRetriever = LocalObjectRetriever;
})(omm || (omm = {}));

module.exports = omm;

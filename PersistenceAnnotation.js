/**
 * Created by bert on 03.05.15.
 */
///<reference path="node_modules\reflect-metadata\reflect-metadata.d.ts"/>
///<reference path="./TypeClass.ts"/>
require("reflect-metadata");
var PersistenceAnnotation = (function () {
    function PersistenceAnnotation() {
    }
    PersistenceAnnotation.className = function (fun) {
        var ret = fun.toString();
        ret = ret.substr('function '.length);
        ret = ret.substr(0, ret.indexOf('('));
        return ret;
    };
    PersistenceAnnotation.getClass = function (o) {
        if (o)
            return o.constructor;
        else
            return undefined;
    };
    // ---- Entity ----
    PersistenceAnnotation.Entity = function (p1) {
        if (typeof p1 == "string") {
            return function (target) {
                var typeClass = target;
                console.log("Entity(<class>) " + PersistenceAnnotation.className(typeClass) + " with collection name:" + p1);
                Reflect.defineMetadata("persistence:collectionName", p1, typeClass);
                Reflect.defineMetadata("persistence:entity", true, typeClass);
                PersistencePrivate.entityClasses[PersistenceAnnotation.className(typeClass)] = typeClass;
            };
        }
        if (typeof p1 == "boolean") {
            return function (target) {
                var typeClass = target;
                console.log("Entity(true) " + PersistenceAnnotation.className(typeClass) + " with collection name:", PersistenceAnnotation.className(typeClass));
                if (p1)
                    Reflect.defineMetadata("persistence:collectionName", PersistenceAnnotation.className(typeClass), typeClass);
                Reflect.defineMetadata("persistence:entity", true, typeClass);
                PersistencePrivate.entityClasses[PersistenceAnnotation.className(typeClass)] = typeClass;
            };
        }
        else if (typeof p1 == "function") {
            //var tc:TypeClass<Persistable> = <TypeClass<Persistable>>p1;
            //var className = PersistenceAnnotation.className(tc);
            //PersistencePrivate.collectionRootClasses.push(tc);
            var typeClass = p1;
            console.log("Entity() " + PersistenceAnnotation.className(typeClass));
            //Reflect.defineMetadata("persistence:collectionName", PersistenceAnnotation.className(typeClass), typeClass);
            Reflect.defineMetadata("persistence:entity", true, typeClass);
            PersistencePrivate.entityClasses[PersistenceAnnotation.className(typeClass)] = typeClass;
        }
    };
    PersistenceAnnotation.getEntityClassByName = function (className) {
        return PersistencePrivate.entityClasses[className];
    };
    PersistenceAnnotation.getCollectionClasses = function () {
        var result = [];
        for (var i in PersistencePrivate.entityClasses) {
            var entityClass = PersistencePrivate.entityClasses[i];
            if (PersistenceAnnotation.getCollectionName(entityClass))
                result.push(entityClass);
        }
        return result;
    };
    PersistenceAnnotation.getEntityClasses = function () {
        var result = [];
        for (var i in PersistencePrivate.entityClasses) {
            var entityClass = PersistencePrivate.entityClasses[i];
            result.push(entityClass);
        }
        return result;
    };
    PersistenceAnnotation.getCollectionName = function (f) {
        return Reflect.getMetadata("persistence:collectionName", f);
    };
    PersistenceAnnotation.isRootEntity = function (f) {
        return !!Reflect.getMetadata("persistence:collectionName", f);
    };
    // ---- typed properties ----
    PersistenceAnnotation.Type = function (typeClassName) {
        return function (targetPrototypeObject, propertyName) {
            console.log("  " + propertyName + " as " + typeClassName);
            var arr = Reflect.getMetadata("persistence:typedproperties", targetPrototypeObject);
            if (!arr) {
                arr = {};
                Reflect.defineMetadata("persistence:typedproperties", arr, targetPrototypeObject);
            }
            arr[propertyName] = typeClassName;
        };
    };
    PersistenceAnnotation.getPropertyClass = function (f, propertyName) {
        var props = Reflect.getMetadata("persistence:typedproperties", f.prototype);
        var className = props ? props[propertyName] : undefined;
        return PersistenceAnnotation.getEntityClassByName(className);
    };
    PersistenceAnnotation.getTypedPropertyNames = function (f) {
        var result = [];
        var props = Reflect.getMetadata("persistence:typedproperties", f.prototype);
        for (var i in props) {
            result.push(i);
        }
        return result;
        //return Reflect.getMetadata("persistence:subdocument",  f, propertyName );
    };
    // ---- AsForeignKeys ----
    PersistenceAnnotation.isStoredAsForeignKeys = function (typeClass, propertyName) {
        var arr = Reflect.getMetadata("persistence:askeys", typeClass.prototype);
        return arr && arr.indexOf(propertyName) != -1;
    };
    PersistenceAnnotation.AsForeignKeys = function (targetPrototypeObject, propertyName) {
        console.log("  " + propertyName + " as foreign key");
        var arr = Reflect.getMetadata("persistence:askeys", targetPrototypeObject);
        if (!arr) {
            arr = [];
            Reflect.defineMetadata("persistence:askeys", arr, targetPrototypeObject);
        }
        arr.push(propertyName);
    };
    // for grammar reasons
    PersistenceAnnotation.AsForeignKey = function (targetPrototypeObject, propertyName) {
        return PersistenceAnnotation.AsForeignKeys(targetPrototypeObject, propertyName);
    };
    // ----  ----
    PersistenceAnnotation.getWrappedFunctionNames = function (f) {
        return PersistenceAnnotation.getPropertyNamesByMetaData(f.prototype, "persistence:wrap");
    };
    PersistenceAnnotation.getPropertyNamesByMetaData = function (o, metaData) {
        var result = [];
        for (var i in o) {
            var value = o[i];
            //console.log("Cave man style debugging 1",i, value,Reflect.getMetadata("persistence:wrap", value) );
            if (typeof value == "function" && Reflect.getMetadata(metaData, value))
                result.push(i);
        }
        return result;
    };
    PersistenceAnnotation.Wrap = function (t, functionName, objectDescriptor) {
        Reflect.defineMetadata("persistence:wrap", true, t[functionName]);
    };
    return PersistenceAnnotation;
})();
var PersistencePrivate = (function () {
    function PersistencePrivate() {
    }
    PersistencePrivate.entityClasses = {};
    return PersistencePrivate;
})();
module.exports = PersistenceAnnotation;
//# sourceMappingURL=PersistenceAnnotation.js.map
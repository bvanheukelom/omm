//import * as reob from "./reob"
import {setNonEnumerableProperty} from "./Internal"
import {SerializationPath, TypeClass, ObjectContext, Object as ReobObject} from "./reob";

export function getClass<T extends Object>(o: T): TypeClass<T> {
    if (o)
        return <TypeClass<T>>o.constructor;
    else
        return undefined;
}

export interface IMethodOptions {
    name?: string;
    parameterTypes?: Array<string>;
    parentObject?: any;
    resultType?: string;
    replaceWithCall?: boolean;
    serverOnly?: boolean;
    propertyName?: string;
}

// TODO rename to something that contains the word "Entity"


// export function isRegisteredWithKey( o:any ):string{
//     for( var i  in registeredObjects ){
//         if( registeredObjects[i] === o ){
//             return i;
//         }
//     }
//     return undefined;
// }

/**
 * @hidden
 */
export var entityClasses: { [index: string]: TypeClass<Object> };


// it seems that the local variable that "reflect" uses is prone to the same difficulties when it gets loaded
// multiple times. This is why it's been removed until it is supported by the Runtime directly.
/**
 * @hidden
 */
function defineMetadata(propertyName, value, cls) {
    if (!cls.hasOwnProperty("_reobAnnotations")) {
        setNonEnumerableProperty(cls, "_reobAnnotations", {});
    }
    var _reobAnnotations = cls._reobAnnotations;
    _reobAnnotations[propertyName] = value;
}

/**
 * @hidden
 */
function getMetadata(propertyName, cls) {
    if (cls.hasOwnProperty("_reobAnnotations"))
        return cls["_reobAnnotations"] ? cls["_reobAnnotations"][propertyName] : undefined;
    else {
        return undefined;
    }
}

/**
 * Declares a class as an entity. Can be used either with or without given name for the entity.
 * @Decorator
 */
export function Entity(name?: string | TypeClass<Object>): any {
    var entityName: string;
    if (typeof name == "string") {
        entityName = <string>name;
    } else {
        entityName = getClassName(<TypeClass<Object>>name)
    }
    var f = function (p1: any) {
        var typeClass: TypeClass<Object> = <TypeClass<Object>>p1;
        defineMetadata("persistence:entity", true, typeClass);
        entityClasses[entityName] = typeClass;
        Object.defineProperty(p1, "_reobClassName", {
            value: entityName,
            writable: false,
            configurable: false,
            enumerable: false
        });
    };
    if (typeof name == "string") {
        return f;
    } else {
        f(name);
    }
}

/**
 * Convenience decorator that combines @CollectionUpdate and @Remote.
 * @Decorator
 */
export function RemoteCollectionUpdate(t: any, functionName: string, objectDescriptor: any) {
    CollectionUpdate(t, functionName, objectDescriptor);
    Remote(t, functionName, objectDescriptor);
}

/**
 * Used to declare a function of a class as a "collection update". That means that whenever the function is called
 * the same operation is also invoked on the document in the collection.
 * @Decorator
 */
export function CollectionUpdate(p1: any, functionName: string, desc) {
    var options = {};

    setPropertyProperty(p1, functionName, "collectionUpdate", options);
    var entityClass = p1.constructor;
    monkeyPatch(entityClass.prototype, functionName, function (originalFunction, ...args: any[]) {
        var _reobObjectContext: ObjectContext = SerializationPath.getObjectContext(this);
        if (!_reobObjectContext || !_reobObjectContext.handler || !_reobObjectContext.handler.collectionUpdate) {
            return originalFunction.apply(this, args);
        } else {
            return _reobObjectContext.handler.collectionUpdate(entityClass, functionName, this, originalFunction, args, _reobObjectContext.request).then((r) => {
                originalFunction.apply(this, args);
                SerializationPath.updateObjectContexts(this, _reobObjectContext.handler, _reobObjectContext.request);
                return r;
            });
        }
    });
    desc.value = entityClass.prototype[functionName];
    return desc;
}

export function ArrayOrMap(typeClassName: string) {
    let f = function (targetPrototypeObject: any, propertyName: string): void {
        setPropertyProperty(targetPrototypeObject, <string>propertyName, "type", typeClassName);
        setPropertyProperty(targetPrototypeObject, <string>propertyName, "arrayOrMap", true);
    };
    return f;
}

export function ArrayType(typeClassName: string) {
    return ArrayOrMap(typeClassName);
}

export function DictionaryType(typeClassName: string) {
    return ArrayOrMap(typeClassName);
}

/**
 * Used to declare which property is used as the value for "_id" in mongo.
 */
export function Id(targetPrototypeObject: any, propertyName: string) {
    DocumentName("_id")(targetPrototypeObject, propertyName);
}

/**
 * In the case where a document consists of multiple subdocuments and the documents are mapped to classes.
 * A property of a class that represents a sub document which is annotated as Parent will hold the reference to the
 * containing document.
 */
export function Parent(targetPrototypeObject: any, propertyName: string) {
    setPropertyProperty(targetPrototypeObject, propertyName, "parent", 1);
}

/**
 * Declares that a property of an entity is not persisted.
 */
export function Ignore(targetPrototypeObject: any, propertyName: string) {
    setPropertyProperty(targetPrototypeObject, propertyName, "ignore", true);
}


export function PrivateToServer(targetPrototypeObject: any, propertyName: string) {
    setPropertyProperty(targetPrototypeObject, propertyName, "privateToServer", true);
}

export function DocumentName(name: string) {
    return function (targetPrototypeObject: any, propertyName: string) {
        var objNames: any = getMetadata("objectNames", targetPrototypeObject);
        if (!objNames) {
            objNames = {};
            defineMetadata("objectNames", objNames, targetPrototypeObject);
        }
        var documentNames: any = getMetadata("documentNames", targetPrototypeObject);
        if (!documentNames) {
            documentNames = {};
            defineMetadata("documentNames", documentNames, targetPrototypeObject);
        }
        objNames[name] = propertyName;
        documentNames[propertyName] = name;
    }
}


export function Type(typeClassName: string) {
    return function (targetPrototypeObject: any, propertyName: string) {
        setPropertyProperty(targetPrototypeObject, propertyName, "type", typeClassName);
    };
}


/**
 * Returns the property previously defined with {@link idProperty} or the _id property.
 * @param o {Object} The object
 * @hidden
 */
export function getId(o: Object) {
    if (typeof o == "undefined")
        return undefined;
    var idPropertyName = getIdPropertyName(getClass(o));
    if (!idPropertyName)
        throw new Error("No id property defined for object of class " + getClass(o));
    else
        return o[idPropertyName];
}


/**
 * @deprecated
 */
export function MeteorMethod(p1: any, p2?: any, d?) {
    Remote(p1, p2, d);
}

export function Remote(p1: any, p2?: any, d?) {
    var f = function (methodOptions: IMethodOptions, descriptor: any) {
        setPropertyProperty(methodOptions.parentObject, methodOptions.propertyName, "methodOptions", methodOptions);
        monkeyPatch(methodOptions.parentObject, methodOptions.propertyName, function (originalFunction, ...args: any[]) {
            var _reobObjectContext: ObjectContext = SerializationPath.getObjectContext(this);
            var request = _reobObjectContext ? _reobObjectContext.request : undefined;
            if (!_reobObjectContext || !_reobObjectContext.handler || !_reobObjectContext.handler.webMethod) {
                return originalFunction.apply(this, args);
            } else {
                return _reobObjectContext.handler.webMethod(methodOptions.parentObject.constructor, methodOptions.propertyName, this, originalFunction, args, request);
            }
        });
        if (descriptor) {
            descriptor.value = methodOptions.parentObject[methodOptions.propertyName];
            return descriptor;
        }
    };

    // parameter case : options
    if (typeof p1 == "object" && typeof p2 == "undefined") {
        return (prototype, functionName: string, d) => {
            var options: IMethodOptions = p1;
            options.parentObject = prototype;
            options.propertyName = functionName;

            return f(options, d);
        };
    } else if (typeof p1 == "string" && typeof p2 == "undefined") { // parameter case : only name
        return (prototype, functionName: string, d) => {
            var options: IMethodOptions = {};
            options.parentObject = prototype;
            options.propertyName = functionName;
            options.name = p1;
            return f(options, d);
        };
    } else { // expression case
        var options: IMethodOptions = {};
        options.parentObject = p1;
        options.propertyName = p2;

        return f(options, d);
    }
}

export function PostCreate(t: any, functionName: string, objectDescriptor: any) {
    setPropertyProperty(t, functionName, "postCreate", true);
}


export function getMethodOptions(typeClass: TypeClass<any>, functionName: string): IMethodOptions {
    return getPropertyProperty(typeClass, functionName, "methodOptions");
}

export function getClassName(cls: TypeClass<ReobObject>): string {
    if (!cls) {
        return undefined;
    } else if (cls['_reobClassName']) {
        return cls['_reobClassName'];
    } else {
        if (cls['name']) {
            return cls['name'];
        } else if (cls.constructor && cls.constructor['name']) {
            return cls.constructor['name'];
        } else {
            var n = cls.toString();
            n = n.substr('function '.length);
            n = n.substr(0, n.indexOf('('));
            return n;
        }
    }
}

export function getRemoteFunctionNames<T extends Object>(typeClass: TypeClass<any>): Array<string> {
    return getPropertyNamesOfPropertiesThatHaveAProperty(typeClass, "methodOptions");
}

export function getPostCreateFunctionNames<T extends Object>(typeClass: TypeClass<any>): Array<string> {
    return getPropertyNamesOfPropertiesThatHaveAProperty(typeClass, "postCreate");
}

export function getRemoteFunctionNamesByObject<T extends Object>(o: any): Array<string> {
    var cls = getClass(o);
    return getRemoteFunctionNames(cls);
}

// public static getAllMethodFunctionNames():Array<string> {
//     var ret = [];
//     for (var i = 0; i < methodFunctions.length; i++) {
//         ret.push(methodFunctions[i].name);
//     }
//     return ret;
// }

// ---- Entity ----

export function getEntityClassByName(className: string): TypeClass<any> {
    return entityClasses[className];
}

// public static getCollectionClasses():Array<TypeClass<Object>> {
//     var result:Array<TypeClass<Object>> = [];
//     for (var i in entityClasses) {
//         var entityClass = entityClasses[i];
//         if (PersistenceAnnotation.getCollectionName(entityClass))
//             result.push(entityClass);
//     }
//     return result;
// }


export function getEntityClasses(): Array<TypeClass<Object>> {
    var result: Array<TypeClass<Object>> = [];
    for (var i in entityClasses) {
        var entityClass = entityClasses[i];
        result.push(entityClass);
    }
    return result;
}

// static getCollectionName(f:TypeClass<any>):string {
//     return getMetadata("persistence:collectionName", f);
// }

// static isRootEntity(f:TypeClass<any>):boolean {
//     return !!PersistenceAnnotation.getCollectionName(f);
// }

export function isEntity(f: TypeClass<any>): boolean {
    return !!entityClasses[getClassName(f)];
}

export function getDocumentPropertyName(typeClass: TypeClass<any>, objectPropertyName: string): string {
    if (!typeClass)
        return undefined;
    var documentNames = getMetadata("documentNames", typeClass.prototype);
    return documentNames ? documentNames[objectPropertyName] : undefined;
}

export function getObjectPropertyName(typeClass: TypeClass<any>, documentPropertyName: string): string {
    if (!typeClass)
        return undefined;
    var objectNames = getMetadata("objectNames", typeClass.prototype);
    return objectNames ? objectNames[documentPropertyName] : undefined;
}

export function isArrayOrMap(f: TypeClass<any>, propertyName: string): boolean {
    while (f != Object) {
        if (getPropertyProperty(f, propertyName, "arrayOrMap"))
            return true;
        f = getParentClass(f);

    }
    return false;
}

// ---- typed properties ----

export function getPropertyClass(f: TypeClass<any>, propertyName: string): TypeClass<any> {
    while (f != <any>Object) {
        var classNameOfF = getPropertyProperty(f, propertyName, "type")
        if (classNameOfF) {
            var p = getEntityClassByName(classNameOfF);
            if (!p)
                throw new Error('Class ' + f + "', property '" + propertyName + "': Defined as type '" + classNameOfF + "'. Could not find an entity with that name.");
            else
                return p;
        }
        f = getParentClass(f);
    }
    return undefined
}

export function getTypedPropertyNames<T extends Object>(f: TypeClass<T>): Array<string> {
    var result: Array<string> = [];
    while (f != <any>Object) {
        var props = getMetadata("property_properties", f);
        for (var i in props) {
            if (props[i].type)
                result.push(i);
        }
        f = getParentClass(f);
    }
    return result;
}

export function setPropertyProperty(cls: TypeClass<any>, propertyName: string, property: string, value: any): void {
    var arr: any = getMetadata("property_properties", cls.constructor);
    if (!arr) {
        arr = {};
        defineMetadata("property_properties", arr, cls.constructor);
    }
    var propProps = arr[propertyName];

    if (!propProps) {
        propProps = {};
        arr[propertyName] = propProps;
    }
    propProps[property] = value;
}

export function getPropertyNamesOfPropertiesThatHaveProperties(cls: TypeClass<any>): Array<string> {
    return Object.keys(getMetadata("property_properties", cls));
}

// this is i.e. good to find all properties on a class that have a "type" property
export function getPropertyNamesOfPropertiesThatHaveAProperty(cls: TypeClass<any>, propertyPropertyName: string): Array<string> {
    var r = [];
    var props = getMetadata("property_properties", cls);
    for (var i in props) {
        if (props[i][propertyPropertyName]) {
            r.push(i);
        }
    }
    return r;
}

export function getPropertyProperty(cls: TypeClass<any>, propertyName: string, propertyProperty: string): any {
    var arr: any = getMetadata("property_properties", cls);
    if (arr && arr[propertyName]) {
        return arr[propertyName][propertyProperty];
    }
    return undefined;
}

export function getParentClass(t: TypeClass<any>): TypeClass<any> {
    if (!t)
        return undefined;

    return Object.getPrototypeOf(t.prototype).constructor;
}


export function getIdPropertyName(t: TypeClass<any>): string {
    return getObjectPropertyName(t, "_id") || "_id";
}


// ---- AsForeignKeys ----

// static isStoredAsForeignKeys(f:TypeClass<any>, propertyName:string):boolean {
//     while (f != Object) {
//         if (PersistenceAnnotation.getPropertyProperty(f, propertyName, "askeys"))
//             return true;
//         f = PersistenceAnnotation.getParentClass(f);
//
//     }
//     return false;
// }

export function isIgnored(f: TypeClass<any>, propertyName: string): boolean {
    //return PersistenceAnnotation.getPropertyProperty(typeClass, propertyName, "ignore");
    while (f != Object) {
        if (getPropertyProperty(f, propertyName, "ignore"))
            return true;
        f = getParentClass(f);

    }
    return false;
}

export function isPrivateToServer(f: TypeClass<any>, propertyName: string): boolean {
    while (f != Object) {
        if (getPropertyProperty(f, propertyName, "privateToServer"))
            return true;
        f = getParentClass(f);
    }
    return false;
}

export function isParent(f: TypeClass<any>, propertyName: string): boolean {
    //return PersistenceAnnotation.getPropertyProperty(typeClass, propertyName, "ignore");
    while (f != Object) {
        if (getPropertyProperty(f, propertyName, "parent"))
            return true;
        f = getParentClass(f);
    }
    return false;
}

export function getParentPropertyNames<T extends Object>(f: TypeClass<T>): Array<string> {
    return getPropertyNamesOfPropertiesThatHaveAProperty(f, 'parent');
}


// ---- Wrap ----

export function getWrappedFunctionNames<T extends Object>(f: TypeClass<T>): Array<string> {
    return getPropertyNamesByMetaData(f.prototype, "persistence:wrap");
}


export function getCollectionUpdateOptions(cls: TypeClass<any>, functionName: string): any {
    if (!cls)
        return undefined;
    return getPropertyProperty(cls.prototype, functionName, "collectionUpdate");
}


export function getCollectionUpdateFunctionNames<T extends Object>(f: TypeClass<T>): Array<string> {
    return getPropertyNamesOfPropertiesThatHaveAProperty(f, 'collectionUpdate');
}

export function getPropertyNamesByMetaData(o: any, metaData: string) {
    var result: Array<string> = [];
    for (var i in o) {
        var value = o[i];
        if (typeof value == "function" && getMetadata(metaData, value))
            result.push(i);
    }
    return result;
}


/**
 * @hidden
 */
function monkeyPatch(object: any, functionName: string, patchFunction: (original: Function, ...arg: any[]) => any) {
    var originalFunction = object[functionName];
    object[functionName] = function monkeyPatchFunction() {
        var args = [];
        args.push(originalFunction);
        for (var i in arguments) {
            args.push(arguments[i]);
        }
        return patchFunction.apply(this, args);
    };
    object[functionName].originalFunction = originalFunction;
}

/**
 * @hidden
 */


(function () {
    var data;
    if (typeof global != "undefined") {
        if (!global["_reob_data"])
            global["_reob_data"] = {};
        data = global["_reob_data"];
    } else if (typeof window != "undefined") {
        if (!window["_reob_data"])
            window["_reob_data"] = {};
        data = window["_reob_data"];
    } else
        data = {};
    if (!data.entityClasses)
        data.entityClasses = {};
    entityClasses = data.entityClasses;


})();


declare module omm {
    interface TypeClass<T> {
        new (): T;
    }
}
interface IMethodOptions {
    isStatic?: boolean;
    object?: string | Object;
    name?: string;
    parameterTypes?: Array<string>;
    resultType?: string;
    parentObject?: Object;
    functionName?: string;
    replaceWithCall?: boolean;
    serverOnly?: boolean;
}
declare module omm {
    var entityClasses: {
        [index: string]: omm.TypeClass<Object>;
    };
    var registeredObjects: {
        [index: string]: any;
    };
    var eventListeners: {
        [index: string]: {
            [index: string]: Array<EventListener>;
        };
    };
    var meteorMethodFunctions: Array<IMethodOptions>;
    function setNonEnumerableProperty(obj: Object, propertyName: string, value: any): void;
    function defineMetadata(propertyName: any, value: any, cls: any): void;
    function getMetadata(propertyName: any, cls: any): any;
    function Entity(entityNameOrP1?: any): any;
    function addEntity(c: TypeClass<Object>): void;
    function getDefaultCollectionName(t: omm.TypeClass<any>): string;
    function addCollectionRoot(t: omm.TypeClass<any>, collectionName: string): void;
    function Wrap(t: any, functionName: string, objectDescriptor: any): void;
    function wrap(t: omm.TypeClass<any>, functionName: string): void;
    function CollectionUpdate(p1: any, fName?: string): (t: any, functionName: string, objectDescriptor: any) => void;
    function collectionUpdate(c: omm.TypeClass<any>, functionName: string, options?: any): void;
    function ArrayOrMap(typeClassName: string): (targetPrototypeObject: any, propertyName: string) => void;
    function ArrayType(typeClassName: string): (targetPrototypeObject: any, propertyName: string) => void;
    function arrayType(c: TypeClass<Object>, propertyName: string, typeClassName: string): void;
    function DictionaryType(typeClassName: string): (targetPrototypeObject: any, propertyName: string) => void;
    function dictionaryType(typeClassName: string): (targetPrototypeObject: any, propertyName: string) => void;
    function AsForeignKeys(targetPrototypeObject: any, propertyName: string): void;
    function Id(targetPrototypeObject: any, propertyName: string): void;
    function Parent(targetPrototypeObject: any, propertyName: string): void;
    function idProperty(c: TypeClass<Object>, propertyName: string): void;
    function Ignore(targetPrototypeObject: any, propertyName: string): void;
    function ignoreProperty(c: TypeClass<Object>, propertyName: string): void;
    function DocumentName(name: string): (targetPrototypeObject: any, propertyName: string) => void;
    function AsForeignKey(targetPrototypeObject: any, propertyName: string): void;
    function Type(typeClassName: string): (targetPrototypeObject: any, propertyName: string) => void;
    function type(t: TypeClass<Object>, propertyName: string, className: string): void;
    function propertyType(t: TypeClass<Object>, propertyName: string, typeClassName: string): void;
    function propertyArrayType(t: TypeClass<Object>, propertyName: string, typeClassName: string): void;
    function propertyDictionaryType(t: TypeClass<Object>, propertyName: string, typeClassName: string): void;
    function asForeignKey(c: TypeClass<Object>, propertyName: string): void;
    function getId(o: Object): any;
    function className(fun: omm.TypeClass<Object>): string;
    function MeteorMethod(p1: any, p2?: any): (t: any, functionName: string, objectDescriptor: any) => void;
    function StaticMeteorMethod(p1: any, p2?: any): any;
    class PersistenceAnnotation {
        static getMethodOptions(functionName: string): IMethodOptions;
        static getMethodFunctionNames<T extends Object>(c: any): Array<string>;
        static getMethodFunctionNamesByObject<T extends Object>(o: any): Array<string>;
        static getAllMethodFunctionNames(): Array<string>;
        static getClass<T extends Object>(o: T): omm.TypeClass<T>;
        static getEntityClassByName(className: string): omm.TypeClass<any>;
        static getCollectionClasses(): Array<omm.TypeClass<Object>>;
        static getEntityClasses(): Array<TypeClass<Object>>;
        static getCollectionName(f: TypeClass<any>): string;
        static isRootEntity(f: TypeClass<any>): boolean;
        static isEntity(f: TypeClass<any>): boolean;
        static getDocumentPropertyName(typeClass: TypeClass<any>, objectPropertyName: string): string;
        static getObjectPropertyName(typeClass: TypeClass<any>, documentPropertyName: string): string;
        static isArrayOrMap(f: TypeClass<any>, propertyName: string): boolean;
        static getPropertyClass(f: TypeClass<any>, propertyName: string): TypeClass<any>;
        static getTypedPropertyNames<T extends Object>(f: TypeClass<T>): Array<string>;
        static setPropertyProperty(cls: TypeClass<any>, propertyName: string, property: string, value: any): void;
        private static getPropertyProperty(cls, propertyName, propertyProperty);
        static getParentClass(t: TypeClass<any>): TypeClass<any>;
        static getIdPropertyName(t: TypeClass<any>): string;
        static isStoredAsForeignKeys(f: TypeClass<any>, propertyName: string): boolean;
        static isIgnored(f: TypeClass<any>, propertyName: string): boolean;
        static isParent(f: TypeClass<any>, propertyName: string): boolean;
        static getParentPropertyNames<T extends Object>(f: TypeClass<T>): Array<string>;
        static getWrappedFunctionNames<T extends Object>(f: TypeClass<T>): Array<string>;
        private static getCollectionUpdateOptions(cls, functionName);
        static getCollectionUpdateFunctionNames<T extends Object>(f: TypeClass<T>): Array<string>;
        static getPropertyNamesByMetaData(o: any, metaData: string): string[];
    }
}
declare module omm {
    interface Document {
        _id?: string;
        serial?: number;
        className?: string;
        [x: string]: any;
    }
}
declare module omm {
    class SubObjectPath {
        private path;
        constructor(s?: string);
        clone(): SubObjectPath;
        forEachPathEntry(iterator: (propertyName: string, index: string | number) => void): void;
        getSubObject(rootObject: Object): Object;
        appendArrayOrMapLookup(name: string, id: string): void;
        appendPropertyLookup(name: string): void;
        toString(): string;
    }
}
declare module omm {
    interface ObjectRetriever {
        getId(o: Object): any;
        getObject(value: string, parentObject?: Object, propertyName?: string): Object;
        preToDocument(o: Object): any;
        postToObject(o: Object): any;
    }
}
declare module omm {
    class Serializer {
        private objectRetriever;
        constructor(retri: ObjectRetriever);
        static init(): void;
        private static installLazyLoaderGetterSetters(c);
        static forEachTypedObject(object: Object, cb: (path: omm.SubObjectPath, object: Object) => void): void;
        static forEachTypedObjectRecursive(rootObject: Object, object: Object, path: omm.SubObjectPath, visited: Array<Object>, cb: (path: omm.SubObjectPath, object: Object) => void): void;
        static needsLazyLoading(object: Object, propertyName: string): boolean;
        toObject<T extends Object>(doc: Document, f?: omm.TypeClass<T>): T;
        private toObjectRecursive<T>(doc, parent, f?);
        toDocument(object: Object): omm.Document;
        private toDocumentRecursive(object, rootClass?, parentObject?, propertyNameOnParentObject?);
        private createDocument(object, rootClass?, parentObject?, propertyNameOnParentObject?);
    }
}
declare module omm {
    class ConstantObjectRetriever implements ObjectRetriever {
        private value;
        constructor(o: Object);
        getId(o: Object): string;
        getObject(s: string): Object;
        preToDocument(o: Object): void;
        postToObject(o: Object): void;
    }
}
declare module omm {
    class SerializationPath {
        private path;
        private objectRetriever;
        constructor(objectRetriever: omm.ObjectRetriever, className: string, id?: string);
        clone(): SerializationPath;
        getCollectionName(): string;
        getObjectRetriever(): omm.ObjectRetriever;
        getId(): string;
        forEachPathEntry(iterator: (propertyName: string, index: string | number) => void): void;
        getSubObject(rootObject: Object): Object;
        appendArrayOrMapLookup(name: string, id: string): void;
        appendPropertyLookup(name: string): void;
        toString(): string;
    }
}
declare module omm {
    interface MeteorPersistable {
        _serializationPath?: omm.SerializationPath;
    }
    class MeteorObjectRetriever implements omm.ObjectRetriever {
        getId(object: MeteorPersistable): string;
        getObject(s: string): Object;
        preToDocument(o: Object): void;
        postToObject(o: Object): void;
        private setSerializationPath(o, pPath);
        updateSerializationPaths(object: MeteorPersistable, visited?: Array<Object>): void;
        retrieveLocalKeys(o: omm.MeteorPersistable, visited?: Array<Object>, rootObject?: omm.MeteorPersistable): void;
    }
}
declare module omm {
    var methodContext: any;
    interface EventListener {
        (i: EventContext<any>, data?: any): void;
    }
    class CallHelper<T extends Object> {
        object: T;
        callback: (error: any, result?: any) => void;
        constructor(o: any, cb?: (error: any, result?: any) => void);
    }
    function registerObject<O extends Object>(key: string, o: O): void;
    function getRegisteredObject(key: string): any;
    function callHelper<O extends Object>(o: O, callback?: (err: any, result?: any) => void): O;
    function staticCallHelper<O extends Object>(tc: O, callback?: (err: any, result?: any) => void): O;
    function call(meteorMethodName: string, ...args: any[]): void;
    class MeteorPersistence {
        static collections: {
            [index: string]: omm.Collection<any>;
        };
        static wrappedCallInProgress: boolean;
        static updateInProgress: boolean;
        static nextCallback: any;
        private static initialized;
        static meteorObjectRetriever: omm.ObjectRetriever;
        static serializer: omm.Serializer;
        static init(): void;
        static objectsClassName(o: any): string;
        static createMeteorMethod(options: IMethodOptions): void;
        static wrapClass<T extends Object>(entityClass: TypeClass<T>): void;
        private static getClassName(o);
        static monkeyPatch(object: any, functionName: string, patchFunction: (original: Function, ...arg: any[]) => any): void;
    }
}
declare module omm {
    class Collection<T extends Object> {
        private meteorCollection;
        private theClass;
        private name;
        private serializer;
        private objectRetriever;
        private eventListeners;
        private static meteorCollections;
        private queue;
        removeAllListeners(): void;
        preSave(f: (evtCtx: omm.EventContext<T>, data: any) => void): void;
        onRemove(f: (evtCtx: omm.EventContext<T>, data: any) => void): void;
        preRemove(f: (evtCtx: omm.EventContext<T>, data: any) => void): void;
        onInsert(f: (evtCtx: omm.EventContext<T>, data: any) => void): void;
        preInsert(f: (evtCtx: omm.EventContext<T>, data: any) => void): void;
        private addListener(topic, f);
        emit(topic: string, data: any): void;
        private emitNow(t, evtCtx, data?);
        private flushQueue();
        private resetQueue();
        constructor(entityClass: omm.TypeClass<T>, collectionName?: string);
        private static _getMeteorCollection(name?);
        getName(): string;
        getMeteorCollection(): any;
        getById(id: string): T;
        protected find(findCriteria: any): Array<T>;
        getAll(): Array<T>;
        protected remove(id: string, cb?: (err: any) => void): void;
        protected documentToObject(doc: Document): T;
        update(id: string, updateFunction: (o: T) => void): any;
        insert(p: T, callback?: (e: any, id?: string) => void): string;
        static resetAll(cb: (error?: any) => void): void;
        getEntityClass(): TypeClass<T>;
    }
}
declare module omm {
    class EventContext<T> {
        private cancelledError;
        preUpdate: T;
        object: T;
        collection: omm.Collection<T>;
        rootObject: any;
        methodContext: any;
        functionName: string;
        serializationPath: omm.SerializationPath;
        topic: string;
        constructor(o: T, coll: omm.Collection<T>);
        cancel(err: any): void;
        cancelledWithError(): any;
    }
    function on<O extends Object>(t: TypeClass<O>, topic: string | EventListener, f?: EventListener): void;
    function onUpdate<O extends Object>(t: TypeClass<O>, functionName?: string | EventListener, f?: EventListener): void;
    function preUpdate<O extends Object>(t: TypeClass<O>, functionName?: string | EventListener, f?: EventListener): void;
    function callEventListeners<O extends Object>(t: TypeClass<O>, topic: string, ctx: omm.EventContext<any>, data?: any): void;
    function removeAllUpdateEventListeners(): void;
    var _queue: Array<any>;
    function resetQueue(): void;
    function emit(topic: any, data?: any): void;
    function deleteQueue(): void;
}
declare module omm {
    class LocalObjectRetriever implements omm.ObjectRetriever {
        constructor();
        private setQuietProperty(obj, propertyName, value);
        getId(o: Object): string;
        getObject(s: string, parentObject?: Object, propertyName?: string): Object;
        preToDocument(o: Object): void;
        postToObject(o: Object): void;
    }
}

declare module 'omm' {
	export=omm;
}

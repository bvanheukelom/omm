declare module omm {
    interface TypeClass<T> {
        new (...some: any[]): T;
    }
}
declare var Reflect: any;
declare module omm {
    var entityClasses: {
        [index: string]: omm.TypeClass<Object>;
    };
    function Entity(p1?: any): any;
    function Wrap(t: Function, functionName: string, objectDescriptor: any): void;
    function ArrayOrMap(typeClassName: string): (targetPrototypeObject: Function, propertyName: string) => void;
    function AsForeignKeys(targetPrototypeObject: Function, propertyName: string): void;
    function AsForeignKey(targetPrototypeObject: Function, propertyName: string): void;
    function Type(typeClassName: string): (targetPrototypeObject: Function, propertyName: string) => void;
    function className(fun: omm.TypeClass<Object>): string;
    class PersistenceAnnotation {
        static getClass<T extends Object>(o: T): omm.TypeClass<T>;
        static getEntityClassByName(className: string): omm.TypeClass<any>;
        static getCollectionClasses(): Array<omm.TypeClass<Object>>;
        static getEntityClasses(): Array<TypeClass<Object>>;
        static getCollectionName(f: TypeClass<any>): string;
        static isRootEntity(f: TypeClass<any>): boolean;
        static isEntity(f: TypeClass<any>): boolean;
        static isArrayOrMap(typeClass: Function, propertyName: string): boolean;
        static getPropertyClass(f: Function, propertyName: string): TypeClass<Object>;
        static getTypedPropertyNames<T extends Object>(f: TypeClass<T>): Array<string>;
        static setPropertyProperty(targetPrototypeObject: Function, propertyName: string, property: string, value: any): void;
        static getPropertyProperty(targetPrototypeObject: Function, propertyName: string, propertyProperty: string): any;
        static isStoredAsForeignKeys(typeClass: Function, propertyName: string): boolean;
        static getWrappedFunctionNames<T extends Object>(f: TypeClass<T>): Array<string>;
        static getPropertyNamesByMetaData(o: any, metaData: string): string[];
    }
}
declare module omm {
    class ConstantObjectRetriever implements ObjectRetriever {
        private value;
        constructor(o: Object);
        getId(o: Object): string;
        getObject(s: string): Object;
        retrieveLocalKeys(o: Object): void;
    }
}
declare module omm {
    interface Document {
        _id?: string;
        serial?: number;
        className?: string;
    }
}
declare module omm {
    interface ObjectRetriever {
        getId(o: Object): any;
        getObject(s: string): Object;
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
    interface Persistable {
        getId?(): string;
        setId?(s: string): void;
        toDocument?(): omm.Document;
        _serializationPath?: omm.SerializationPath;
    }
}
declare module omm {
    class Serializer {
        private objectRetriever;
        constructor(retri: ObjectRetriever);
        static init(): void;
        private static installLazyLoaderGetterSetters(c);
        private setSerializationPath(o, pPath);
        static needsLazyLoading(object: Persistable, propertyName: string): boolean;
        _updateSerializationPaths(object: Persistable, visited?: Array<Persistable>): void;
        toObject<T extends omm.Persistable>(doc: Document, f: omm.TypeClass<T>): T;
        private toObjectRecursive<T>(doc, f);
        toDocument(object: omm.Persistable): omm.Document;
        private toDocumentRecursive(object, rootClass?, parentObject?, propertyNameOnParentObject?);
        private createDocument(object, rootClass?, parentObject?, propertyNameOnParentObject?);
        private retrieveLocalKeys(o, visited?, rootObject?);
    }
}
///<reference path="./references.d.ts"/>
module mapper
{
    export function Entity( p1?:any ):any
    {
        if( typeof p1=="string")
        {
            return function (target:Function) {
                var typeClass:TypeClass<Persistable> = <TypeClass<Persistable>>target;
                console.log("Entity(<class>) "+className(typeClass)+" with collection name:"+p1);
                Reflect.defineMetadata("persistence:collectionName", p1, typeClass);
                Reflect.defineMetadata("persistence:entity", true, typeClass);
                PersistencePrivate.entityClasses[className(typeClass)]=typeClass;
            }
        }
        if( typeof p1=="boolean" )
        {
            return function (target:Function) {
                var typeClass:TypeClass<Persistable> = <TypeClass<Persistable>>target;
                console.log("Entity(true) "+className(typeClass)+" with collection name:", className(typeClass));
                if( p1 )
                    Reflect.defineMetadata("persistence:collectionName", className(typeClass), typeClass);
                Reflect.defineMetadata("persistence:entity", true, typeClass);
                PersistencePrivate.entityClasses[className(typeClass)]=typeClass;
            }
        }
        else if( typeof p1=="function" ) // annotated without braces
        {
            //var tc:TypeClass<Persistable> = <TypeClass<Persistable>>p1;
            //var className = PersistenceAnnotation.className(tc);
            //PersistencePrivate.collectionRootClasses.push(tc);
            var typeClass:TypeClass<Persistable> = <TypeClass<Persistable>>p1;

            console.log("Entity() "+className(typeClass));
            //Reflect.defineMetadata("persistence:collectionName", PersistenceAnnotation.className(typeClass), typeClass);
            Reflect.defineMetadata("persistence:entity", true, typeClass);
            PersistencePrivate.entityClasses[className(typeClass)]=typeClass;
        }
    }

    export function Wrap( t:Function, functionName:string, objectDescriptor:any )
    {
        Reflect.defineMetadata("persistence:wrap", true, (<any>t)[functionName] );
    }

    export function ArrayOrMap( typeClassName:string )
    {
        return function (targetPrototypeObject: Function, propertyName:string) {
            console.log("  "+propertyName+" as collection of "+typeClassName);
            PersistenceAnnotation.setPropertyProperty( targetPrototypeObject, propertyName, "type", typeClassName);
            PersistenceAnnotation.setPropertyProperty( targetPrototypeObject, propertyName, "arrayOrMap", true);
        };
    }

    export function AsForeignKeys( targetPrototypeObject:Function, propertyName:string  )
    {
        return PersistenceAnnotation.setPropertyProperty(targetPrototypeObject, propertyName, "askeys", true);
    }

    // for grammar reasons
    export function AsForeignKey( targetPrototypeObject:Function, propertyName:string  )
    {
        return AsForeignKeys(targetPrototypeObject, propertyName );
    }

    export function Type(typeClassName:string) {
        return function (targetPrototypeObject: Function, propertyName:string) {
            console.log("  "+propertyName+" as "+typeClassName);
            PersistenceAnnotation.setPropertyProperty( targetPrototypeObject, propertyName, "type", typeClassName);
        };
    }


    export function className(fun:TypeClass<Persistable>):string
    {
        var ret = fun.toString();
        ret = ret.substr('function '.length);
        ret = ret.substr(0, ret.indexOf('('));
        return ret;
    }

    export class PersistenceAnnotation
    {
        static getClass<T extends Object>( o:T ):TypeClass<T>
        {
            if( o )
                return <TypeClass<T>>o.constructor;
            else
                return undefined;
        }

    // ---- Entity ----

        static getEntityClassByName( className:string ):TypeClass<any>
        {
            return PersistencePrivate.entityClasses[className];
        }

        public static getCollectionClasses():Array<TypeClass<Persistable>>
        {
            var result:Array<TypeClass<Persistable>> = [];
            for( var i in PersistencePrivate.entityClasses )
            {
                var entityClass = PersistencePrivate.entityClasses[i];
                if( PersistenceAnnotation.getCollectionName(entityClass) )
                    result.push(entityClass);
            }
            return result;
        }

        public static getEntityClasses():Array<TypeClass<Persistable>>
        {
            var result:Array<TypeClass<Persistable>> = [];
            for( var i in PersistencePrivate.entityClasses )
            {
                var entityClass = PersistencePrivate.entityClasses[i];
                result.push(entityClass);
            }
            return result;
        }

        static getCollectionName(f:TypeClass<any>):string {
            return Reflect.getMetadata("persistence:collectionName", f);
        }
        static isRootEntity(f:TypeClass<any>):boolean {
            return !!PersistenceAnnotation.getCollectionName(f);
        }
        static isEntity(f:TypeClass<any>):boolean {
            return !!PersistencePrivate.entityClasses[className(f)];
        }

        // ---- Collection ----



        static isArrayOrMap( typeClass:Function, propertyName:string ):boolean
        {
            return PersistenceAnnotation.getPropertyProperty( typeClass.prototype, propertyName, "arrayOrMap")==true;
        }

    // ---- typed properties ----


        static getPropertyClass(f:Function, propertyName:string):TypeClass<Persistable> {
            var className = PersistenceAnnotation.getPropertyProperty( f.prototype, propertyName, "type")
            if( !className )
                return undefined;
            else
                return PersistenceAnnotation.getEntityClassByName(className);
        }

        static getTypedPropertyNames<T extends Persistable>(f:TypeClass<T>):Array<string> {
            var result:Array<string> = [];
            var props = Reflect.getMetadata("persistence:typedproperties",f.prototype);
            for( var i in props )
            {
                if( PersistenceAnnotation.getPropertyClass(f, i) )
                    result.push(i);
            }
            return result;
        }

        static setPropertyProperty( targetPrototypeObject:Function, propertyName:string, property:string, value:any  ):void {
            var arr:any = Reflect.getMetadata("persistence:typedproperties", targetPrototypeObject);
            if( !arr ) {
                arr = {};
                Reflect.defineMetadata("persistence:typedproperties", arr, targetPrototypeObject );
            }
            var propProps = arr[propertyName];

            if( !propProps )
            {
                propProps = {};
                arr[propertyName] = propProps;
            }
            propProps[property] = value;
        }

        private static getPropertyProperty( targetPrototypeObject:Function, propertyName:string, propertyProperty:string ):any
        {
            var arr:any = Reflect.getMetadata("persistence:typedproperties", targetPrototypeObject);
            if( arr && arr[propertyName] )
            {
                return arr[propertyName][propertyProperty];
            }
            return undefined;
        }
        // ---- AsForeignKeys ----

        static isStoredAsForeignKeys( typeClass:Function, propertyName:string ):boolean
        {
            return PersistenceAnnotation.getPropertyProperty(typeClass.prototype, propertyName, "askeys");
        }


        // ---- Wrap ----

        public static getWrappedFunctionNames<T extends Persistable>(f:TypeClass<T>):Array<string>
        {
            return PersistenceAnnotation.getPropertyNamesByMetaData(f.prototype, "persistence:wrap");
        }

        private static getPropertyNamesByMetaData( o:any, metaData:string )
        {
            var result:Array<string> = [];
            for( var i in o )
            {
                var value = o[i];
                //console.log("Cave man style debugging 1",i, value,Reflect.getMetadata("persistence:wrap", value) );
                if( typeof value =="function" && Reflect.getMetadata(metaData, value) )
                    result.push(i);
            }
            return result;
        }



    }
    class PersistencePrivate
    {
        static entityClasses:{[index:string]:TypeClass<Persistable>} = {};
    }
}
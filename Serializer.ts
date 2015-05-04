/**
 * Created by bert on 04.05.15.
 */

import Persistable = require("./Persistable");
import Document = require("./Document");
import PersistenceAnnotation = require("./PersistenceAnnotation");

class Serializer
{
    static toObject<T extends Persistable>( doc:any, f?:Function ):T
    {
        var o:any;
        if( f )
        {
            o = Object.create(f.prototype);
            f.call(o);
        }
        else
        {
            o = {};
        }
        for( var propertyName in doc )
        {
            var value = doc[propertyName];
            if( value instanceof Array )
            {
                var arr:Array<any> = <Array<any>>value;
                o[propertyName] = [];
                var entryClass = PersistenceAnnotation.getPropertyClass(f, propertyName);
                for( var i=0; i<arr.length;i++ )
                {
                    var arrayEntry = Serializer.toObject( arr[i], entryClass );

                }
            }
            else if( typeof value == 'object' )
            {
                var propertyClass = PersistenceAnnotation.getPropertyClass(f, propertyName);
                o[propertyName] = Serializer.toObject( value, entryClass );
            }
            else
            {
                o[propertyName] = value;
            }
        }
        return o;
    }

    static toDocument( object:Persistable, depth?:number ):Document
    {
        debugger;
        var result:Document;
        if( PersistenceAnnotation.getCollectionName( object.constructor ) && depth )
            return object.getId();
        else if( typeof object.toDocument == "function" )
            result = object.toDocument();
        else
            result = Serializer.createDocument(object, depth);
        return result;
    }

    static createDocument( object: any, depth?:number ): Document
    {
        if( !depth )
            depth = 0;
        var doc:any = {};
        for (var property in object)
        {
            //if (excludedProperties && excludedProperties.indexOf(property)!=-1 )
            //{
            //    //console.log("Skipping excluded property : " + property);
            //    continue;
            //}
            if (object[property] !== undefined && property != "persistencePath")
            {
                // primitives
                if (typeof object[property] == "string" || typeof object[property] == "number" || typeof object[property] == "date" || typeof object[property] == "boolean")
                    doc[property] = object[property];

                // array
                else if (object[property] instanceof Array)
                {
                    doc[property] = [];
                    var arr:Array<any> = object[property];
                    for( var i=0; i<arr.length; i++ )
                    {
                        var subObject = arr[i];
                        doc[property].push( Serializer.toDocument(subObject, depth+1) );
                    }
                }

                // object
                else if (typeof object[property] == 'object')
                {
                    doc[property] = Serializer.toDocument( object[property], depth+1 );
                }

                else if (typeof object[property] == 'function')
                {
                    // not doing eeeeenithing with functions
                }
                else
                {
                    console.error("Unsupported type : ", typeof object[property]);
                }
            }
        }
        return <Document>doc;
    }

}
export = Serializer

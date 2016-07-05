
import { MeteorPersistable } from "./MeteorPersistable"
import * as PersistenceAnnotation from "../annotations/PersistenceAnnotation"

export class SerializationPath {
    private path:string;
    isClient:boolean;

    // this is used when lazy loading properties
    // private objectRetriever:ObjectRetriever;

    constructor(collectionName:string, id?:string) {
        this.path = collectionName;
        // this.objectRetriever = objectRetriever;
        if (id) this.path += "[" + id + "]";
        if (!this.getId())
            throw new Error("id is undefined");
    }

    clone():SerializationPath {
        var sp =  new SerializationPath(this.path);
        sp.isClient = this.isClient;
        return sp;
    }

    getCollectionName():string {
        return this.path.split("[")[0];
    }

    getId():string {
        return this.path.split("[")[1].split("]")[0];
    }

    forEachPathEntry( iterator:(propertyName:string, index:string|number)=>void ){
        if (this.path.indexOf(".") != -1)
            this.path.split("].")[1].split(".").forEach(function(entry:string){
                var propertyName = entry;
                var index = undefined;
                if (entry.indexOf("|") != -1) {
                    propertyName =  entry.split("|")[0];
                    index =  entry.split("|")[1];
                }
                iterator(propertyName, index);
            });
    }

    getSubObject(rootObject:Object):Object {
        var o:any = rootObject;
        if (this.path.indexOf(".") != -1) {
            this.path.split("].")[1].split(".").forEach(function (entry:string) {
                if( o ) {
                    if (entry.indexOf("|") != -1) {
                        var p = entry.split("|");
                        var arrayOrMap = o[p[0]];
                        var id = p[1];
                        var foundEntry:boolean = false;
                        for (var j in arrayOrMap) {
                            var arrayEntry:Object = arrayOrMap[j];
                            if ((<any>arrayEntry).getId && (<any>arrayEntry).getId() == id) {
                                o = arrayEntry;
                                foundEntry = true;
                                break;
                            }
                        }
                        if (!foundEntry) {
                            if( arrayOrMap[id] )
                                o = arrayOrMap[id];
                            else
                                o = undefined;

                        }

                    }
                    else
                        o = o[entry];
                }
            });
        }
        return o;
    }

    appendArrayOrMapLookup(name:string, id:string):void {
        this.path += "." + name + "|" + id;
    }

    appendPropertyLookup(name:string):void {
        this.path += "." + name;
    }

    toString() {
        return this.path;
    }

    static setSerializationPath( o:MeteorPersistable, pPath:SerializationPath ){
        PersistenceAnnotation.setNonEnumerableProperty(o, "_serializationPath", pPath);
    }

    // if I could I would make this package protected
    static updateSerializationPaths(object:MeteorPersistable, visited?:Array<Object>):void {
        var that = this;
        if (!visited)
            visited = [];
        if (visited.indexOf(object) != -1)
            return;
        if( !object || typeof object!="object" )
            return;

        visited.push(object);
        var objectClass = PersistenceAnnotation.PersistenceAnnotation.getClass(object);
        if (PersistenceAnnotation.PersistenceAnnotation.isRootEntity(objectClass)) {
            if (!object._serializationPath) {
                var idPropertyName = PersistenceAnnotation.PersistenceAnnotation.getIdPropertyName(objectClass);
                var id = object[idPropertyName];
                if ( id )
                    SerializationPath.setSerializationPath( object, new SerializationPath( PersistenceAnnotation.PersistenceAnnotation.getCollectionName(objectClass), id) );
            }
        }
        if (!object._serializationPath)
            return; // we're done here


        PersistenceAnnotation.PersistenceAnnotation.getTypedPropertyNames(objectClass).forEach(function (typedPropertyName:string) {
            // if (!PersistenceAnnotation.isStoredAsForeignKeys(objectClass, typedPropertyName)) {
            //     //console.log("updating foreignkey property " + typedPropertyName);
            var v:MeteorPersistable = object[typedPropertyName];
            if (v) {
                if (PersistenceAnnotation.PersistenceAnnotation.isArrayOrMap(objectClass, typedPropertyName)) {
                    //console.log("updating foreignkey property " + typedPropertyName + " is array");
                    for (var i in v) {
                        var e = v[i];
                        if( e ) {
                            var index = i;
                            if (PersistenceAnnotation.getId(e))
                                index = PersistenceAnnotation.getId(e);
                            //console.log("updating persistnece path for isArrayOrMap " + typedPropertyName + "  key:" + i + " value:", e, "object: ", object);
                            that.setSerializationPath(e, object._serializationPath.clone());
                            e._serializationPath.appendArrayOrMapLookup(typedPropertyName, index);
                            that.updateSerializationPaths(e, visited);
                        }
                    }
                }
                else {
                    //console.log("updating foreignkey property direct property " + typedPropertyName);
                    that.setSerializationPath( v, object._serializationPath.clone() );
                    v._serializationPath.appendPropertyLookup(typedPropertyName);
                    that.updateSerializationPaths(v, visited);
                }
            }

        });
    }

}

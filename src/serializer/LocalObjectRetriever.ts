
import ObjectRetriever from "./ObjectRetriever"
import SubObjectPath from "./SubObjectPath"
import Serializer from "./Serializer"
import * as PersistenceAnnotation from "../annotations/PersistenceAnnotation"

export default class LocalObjectRetriever implements ObjectRetriever{
    constructor(){
    }

    private setQuietProperty( obj:Object, propertyName:string, value:any ){
        if (!Object.getOwnPropertyDescriptor(obj, propertyName)) {
            Object.defineProperty(obj, propertyName, {
                configurable: false,
                enumerable: false,
                writable: true
            });
        }
        obj[propertyName] = value;
    }

    getId(o: Object): string{
        var p = o["localPath"];
        return p;
    }

    getObject(s: string, parentObject?:Object, propertyName?:string ): Promise<Object>{
        var subObjectPath= new SubObjectPath(s);
        return Promise.resolve(subObjectPath.getSubObject( parentObject["rootObject"] ));
    }

    preToDocument(o:Object){
        var that = this;
        // Serializer.forEachTypedObject(o, function(path:SubObjectPath, subO:Object){
        //     that.setQuietProperty(subO,"localPath",path.toString());
        // });
    }

    postToObject(o:Object){
        var that = this;
        Serializer.forEachTypedObject(o, function(path:SubObjectPath, subO:Object){
            that.setQuietProperty(subO,"rootObject",o);
        });
    }

}
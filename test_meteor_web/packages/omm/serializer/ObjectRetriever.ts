module omm{
    export interface ObjectRetriever {
        getId(o:Object);
        getObject(value:string, parentObject?:Object, propertyName?:string ):Object;
        preToDocument(o:Object);
        postToObject(o:Object);
    }
}

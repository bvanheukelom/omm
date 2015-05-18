///<reference path="./references.d.ts"/>

module mapper {
    export class MeteorObjectRetriever implements ObjectRetriever {
        getId(object:Persistable):string {
            if (object.persistencePath)
                return object.persistencePath.toString();
            else {
                var objectClass = mapper.PersistenceAnnotation.getClass(object);
                if (mapper.PersistenceAnnotation.isRootEntity(objectClass) && object.getId()) {
                    return new mapper.PersistencePath(mapper.PersistenceAnnotation.getCollectionName(objectClass), object.getId()).toString();
                }
                else {
                    throw new Error("Error while 'toString'. Objects that should be stored as foreign keys need to be persisted beforehand or be the root entity of a collection and have an id.");
                }
            }
        }

        getObject(s:string):Object {
            if (typeof s != "string")
                throw new Error("Path needs to be a string");
            var persistencePath = new mapper.PersistencePath(s);
            //var typeClass:TypeClass<any> = mapper.PersistenceAnnotation.getCollectionName(persistencePath.getClassName());
            //if (!typeClass || typeof typeClass != "function")
            //    throw new Error("Could not load path. No class found for class name :" + persistencePath.getClassName() + ". Key:" + s);
            var collectionName =persistencePath.getCollectionName();
            var collection:mapper.BaseCollection<Persistable> = collectionName ? mapper.MeteorPersistence.collections[collectionName] : undefined;
            if (collection) {
                var rootValue = collection.getById(persistencePath.getId());
                var newValue = rootValue ? persistencePath.getSubObject(rootValue) : undefined;
                return newValue;
            }
            else
                throw new Error("No collection found to retrieve object. Key:" + s);
        }
    }
}
/// <reference path="./../serializer/Serializer.ts" />
/// <reference path="./../serializer/ConstantObjectRetriever.ts" />
/// <reference path="./MeteorPersistence.ts" />
/// <reference path="./MeteorObjectRetriever.ts" />
/**
 * @namespace omm
 */
module omm {

    export class Collection<T extends Object>
    {
        private meteorCollection:any;
        private theClass:TypeClass<T>;
        private name:string;
        private serializer:omm.Serializer;
        private objectRetriever:omm.MeteorObjectRetriever;

        private static meteorCollections:{[index:string]:any} = { };

        /**
         * Represents a Mongo collection that contains entities.
         * @param c {function} The constructor function of the entity class.
         * @param collectionName {string=} The name of the collection
         * @class
         * @memberof omm
         */
        constructor( entityClass:omm.TypeClass<T>, collectionName?:string ) {
            this.objectRetriever = new omm.MeteorObjectRetriever();
            this.serializer = new omm.Serializer( this.objectRetriever );
            //var collectionName = omm.PersistenceAnnotation.getCollectionName(persistableClass);
            if( !collectionName )
                collectionName = omm.getDefaultCollectionName(entityClass);
            omm.addCollectionRoot(entityClass, collectionName);
            this.name = collectionName;
            if( !MeteorPersistence.collections[collectionName] ) {
                // as it doesnt really matter which base collection is used in meteor-calls, we're just using the first that is created
                MeteorPersistence.collections[collectionName] = this;
            }
            this.meteorCollection = Collection._getMeteorCollection(collectionName);
            this.theClass = entityClass;
        }

        static getCollection<P extends Object>( t:omm.TypeClass<P> ):Collection<P> {
            return MeteorPersistence.collections[omm.PersistenceAnnotation.getCollectionName(t)];
        }

        private static _getMeteorCollection( name?:string ) {
            if( !Collection.meteorCollections[name] ) {
                if( name!="users") {
                    Collection.meteorCollections[name] = new (<any>Meteor).Collection( name );
                }
                else
                    Collection.meteorCollections[name] = Meteor.users;
            }
            return Collection.meteorCollections[name];
        }

        /**
         * Gets the name of the collection.
         * @returns {string}
         */
        getName():string {
            return this.name;
        }

        /**
         * Returns the underlying mongo collection.
         * @returns {any}
         */
        getMeteorCollection( ):any
        {
            return this.meteorCollection;
        }

        /**
         * Loads an object from the collection by its id.
         * @param id {string} the id
         * @returns {T} the object or undefined if it wasn't found
         */
        getById(id:string):T
        {
            var o = this.find({
                "_id": id
            });
            return o.length>0?o[0]:undefined;
        }

        /**
         * Finds objects based on a selector.
         * @param {object} findCriteria the mongo selector
         * @returns {Array<T>}
         * @protected
         */
        protected find(findCriteria:any):Array<T>
        {
            var documents:Array<Document> = this.meteorCollection.find(findCriteria).fetch();
            var objects:Array<T> = [];
            for (var i = 0; i < documents.length; i++) {
                var document:Document = documents[i];
                objects[i] = this.documentToObject(document);
            }
            return objects;
        }

        /**
         * Gets all objects in a collection.
         * @returns {Array<T>}
         */
        getAll():Array<T>
        {
            return this.find({});
        }

        /**
         * Removes an entry from a collection
         * @param id {string} the id of the object to be removed from the collection
         * @callback cb the callback that's called once the object is removed or an error happend
         */
        protected remove( id:string, cb?:(err:any)=>void )
        {
            if( Meteor.isServer ) {
                if (id) {
                    this.meteorCollection.remove(id,cb);
                }
                else
                    throw new Error("Trying to remove an object that does not have an id.");
            }
            else
                throw new Error("Trying to remove an object from the client. 'remove' can only be called on the server.");
        }

        protected documentToObject( doc:Document ):T
        {
            var p:T = this.serializer.toObject<T>(doc, this.theClass);
            this.objectRetriever.updateSerializationPaths(p);
            this.objectRetriever.retrieveLocalKeys(p);
            return p;
        }

        /**
         * Performs an update on an object in the collection. After the update the object is attempted to be saved to
         * the collection. If the object has changed between the time it was loaded and the time it is saved, the whole
         * process is repeated. This means that the updateFunction might be called more than once.
         * @param id - the id of the object
         * @param updateFunction - the function that alters the loaded object
         */
        update(id:string, updateFunction:(o:T)=>void)
        {
            omm.MeteorPersistence.updateInProgress = true;
            try {
                if (!id)
                    throw new Error("Id missing");
                for (var i = 0; i < 10; i++) {
                    var document:omm.Document = this.meteorCollection.findOne({
                        _id: id
                    });

                    if (!document) {
                        throw new Error("No document found for id: " + id);
                    }

                    var currentSerial = document.serial;

                    // call the update function
                    var object:T = this.documentToObject(document);
                    var result = updateFunction(object);

                    this.objectRetriever.updateSerializationPaths(object);

                    var documentToSave:Document = this.serializer.toDocument(object);
                    documentToSave.serial = currentSerial + 1;

                    // update the collection
                    //console.log("writing document ", documentToSave);
                    var updatedDocumentCount = this.meteorCollection.update({
                        _id: id,
                        serial: currentSerial
                    }, documentToSave);

                    // verify that that went well
                    if (updatedDocumentCount == 1) {
                        return result; // we're done
                    }
                    else if (updatedDocumentCount > 1)
                        throw new Meteor.Error("verifiedUpdate should only update one document");
                    else {
                        //console.log("rerunning verified update ");
                        // we need to do this again
                    }
                }
                throw new Error("update gave up after 10 attempts to update the object ");
            }
            finally{
                omm.MeteorPersistence.updateInProgress = false;
            }
        }

        /**
         * callback is called once the object got inserted or an error happened
         * @callback omm.Collection~insertCallback
         * @param e {any} error
         * @param id {id=} string
         */

        /**
         * Inserts an object into the collection
         * @param p the object
         * @param {omm.Collection~insertCallback} callback
         * @returns {string} the id of the new object
         */
        insert( p:T, callback?:(e:any, id?:string)=>void ):string
        {
            //if( Meteor.isServer )
            //{

                // TODO make sure that this is unique
                var idPropertyName = omm.PersistenceAnnotation.getIdPropertyName(this.theClass);
                if( !p[idPropertyName] )
                    p[idPropertyName] = new (<any>Mongo.ObjectID)()._str;
                var doc : Document = this.serializer.toDocument( p );
                //if( typeof p.getId=="function" && p.getId() )
                //    doc._id = p.getId();
                //else
                //    doc._id = ;

                doc.serial = 0;
                //console.log( "inserting document: ", doc);
                var that = this;
                function afterwards(e:any, id?:string){
                    if( !e )
                    {
                        //console.log( "inserted into '"+that.getName()+"' new id:"+id);
                        p[idPropertyName] = id;
                        that.objectRetriever.postToObject(p); // kind of the same thing?
                    }
                    else{
                        //console.log("error while inserting into "+this.name, e);
                    }
                    if( callback )
                        callback( e,id );
                }

                try{
                    var id = this.meteorCollection.insert(doc, callback?afterwards:undefined);
                    if( !callback )
                        afterwards( undefined, id );
                    else
                        return id;
                }
                catch( e )
                {
                    if( !callback )
                        afterwards(e);
                }
                return id;
            //}
            //else
            //    throw new Error("Insert can not be called on the client. Wrap it into a meteor method.");
        }

        /**
         * called once the objects are removed or an error happens
         * @callback omm.Collection~resetAllCallback
         * @param error {any=} if an error occured it is passed to the callback
         */

        /**
         * removes all objects (for testing purposes)
         * @param {omm.Collection~resetAllCallback} cb called when it's done
         */
        @omm.StaticMeteorMethod({replaceWithCall:true, parameterTypes:['callback']})
        static resetAll( cb:(error?:any)=>void ){
            var arr = [];
            for( var i in Collection.meteorCollections )
                arr.push(Collection.meteorCollections[i]);
            if( arr.length>0 ){
                for( var j in arr )
                {
                    if( j!=arr.length-1)
                        Meteor.wrapAsync(function(cb2){
                            arr[j].remove({},cb2);
                        })();
                    else {
                        arr[j].remove({}, cb);
                    }
                }
            }
            else
                cb();

        }

    }
}
//omm.MeteorPersistence.wrapFunction( omm.Collection, "resetAll", "resetAll", true, null, new omm.ConstantObjectRetriever(omm.Collection) );

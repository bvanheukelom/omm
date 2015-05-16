///<reference path="references.d.ts"/>

describe("The persistence thing", function(){
    var personCollection:TestPersonCollection;
    var treeCollection:TestTreeCollection;
    beforeAll(function(){
        personCollection = new TestPersonCollection();
        treeCollection = new TestTreeCollection();
    });


    beforeEach(function(done){
        console.log("------------------- new test");
        persistence.BaseCollection.resetAll(function(error){
            if (!error)
                done();
            else
                fail(error);
        });
    });

    it( "knows the difference between root entities and subdocument entities ", function(){
        expect( persistence.PersistenceAnnotation.getCollectionName(Tests.TestPerson) ).toBe("TestPerson");
        expect( persistence.PersistenceAnnotation.isRootEntity(Tests.TestPerson) ).toBeTruthy();
        expect( persistence.PersistenceAnnotation.isRootEntity(Tests.TestTree) ).toBeTruthy();
        expect( persistence.PersistenceAnnotation.isRootEntity(Tests.TestLeaf) ).toBeFalsy();
    });

    it( "knows the name of collections", function(){
        expect( personCollection.getName() ).toBe("TestPerson");
        expect( treeCollection.getName() ).toBe("TheTreeCollection");
    });

    it( "knows the difference between root entities and subdocument entities ", function(){
        expect( persistence.PersistenceAnnotation.getCollectionName(Tests.TestPerson) ).toBe("TestPerson");
        expect( persistence.PersistenceAnnotation.isRootEntity(Tests.TestPerson) ).toBeTruthy();
        expect( persistence.PersistenceAnnotation.isRootEntity(Tests.TestTree) ).toBeTruthy();
        expect( persistence.PersistenceAnnotation.isRootEntity(Tests.TestLeaf) ).toBeFalsy();
    });

    it( "knows types ", function(){
        expect( persistence.PersistenceAnnotation.getPropertyClass(Tests.TestPerson, "tree") ).toBe(Tests.TestTree);
        expect( persistence.PersistenceAnnotation.getPropertyClass(Tests.TestPerson, "leaf") ).toBe(Tests.TestLeaf);
    });

    it("can do basic inserts", function( done ){
        treeCollection.newTree( 20, function(error, tree:Tests.TestTree){
            expect( error ).toBeFalsy();
            expect( tree ).toBeDefined();
            expect( (<any>tree).persistencePath ).toBeDefined();
            expect( tree instanceof Tests.TestTree).toBeTruthy();
            expect( tree.getId()).toBeDefined();
            expect( tree.getHeight()).toBe(20);
            expect( treeCollection.getById(tree.getId())).toBeDefined();
            expect( treeCollection.getById(tree.getId()).getId()).toBeDefined();
            expect( treeCollection.getById(tree.getId()).getHeight()).toBe(20);
            done();
        });
    });
    fit("can call server functions", function( done ){
        treeCollection.serverFunction("World", new Tests.TestTree(212), 42, function(e:any,s:string){
            expect( s ).toBe( "Hello World! This is on the server t:true 212 n:42 number" );
            expect(e).toBeUndefined();
            done();
        });
    });

    it("can monkey patch functions", function( ){
        var f = function f(){
            this.c = 0;
        };
        f.prototype.hello = function(p){
            this.c+=p;
        };
        persistence.MeteorPersistence.monkeyPatch(f.prototype, "hello", function( original, p ){
            expect(this.c).toBe(0);
            this.c++;
            original.call(this, p);

        });
        var x:any = new f();
        x.hello(20);
        expect( x.c ).toBe(21)
    });

    it("uses persistence paths to return undefined for non existent subobjects ", function(){
        var t1:Tests.TestTree = new Tests.TestTree(10);
        var pp:persistence.PersistencePath = new persistence.PersistencePath("TestTree", "tree1");
        pp.appendArrayOrMapLookup("leaves", "nonexistentLeaf");
        expect( pp.getSubObject(t1) ).toBeUndefined();
    });

    it("can do basic removes", function(done){


        treeCollection.newTree(20,function(err, t:Tests.TestTree){
            expect( treeCollection.getById(t.getId())).toBeDefined();
            treeCollection.deleteTree(t.getId(), function(err){
                expect( treeCollection.getById(t.getId())).toBeUndefined();
                done();
            });
        });
    });
    //
    it("uses persistence paths on root documents", function(){
        var t1:Tests.TestTree = new Tests.TestTree(123);
        t1.setId("tree1");
        t1.grow();
        persistence.MeteorPersistence.updatePersistencePaths(t1);
        expect(t1["persistencePath"]).toBeDefined();
        expect(t1["persistencePath"].toString()).toBe("TheTreeCollection[tree1]");
    });

    it("uses persistence paths on sub documents", function(){
        var tp:Tests.TestPerson = new Tests.TestPerson("tp1");
        tp.phoneNumber = new Tests.TestPhoneNumber("12345");
        persistence.MeteorPersistence.updatePersistencePaths(tp);
        expect(tp.phoneNumber["persistencePath"]).toBeDefined();
        expect(tp.phoneNumber["persistencePath"].toString()).toBe("TestPerson[tp1].phoneNumber");
    });

    it("can call wrapped functions that are not part of a collection", function(){
        var t1:Tests.TestTree = new Tests.TestTree(10);
        t1.grow();
        expect(t1.getLeaves().length).toBe(1);
    });


    it("uses persistence paths on subdocuments in arrays", function(){
        var t1:Tests.TestTree = new Tests.TestTree(10);
        t1.setId("tree1");
        t1.grow();
        persistence.MeteorPersistence.updatePersistencePaths(t1);
        expect(t1.getLeaves().length).toBe(1);
        expect(t1.getLeaves()[0]["persistencePath"]).toBeDefined();
        expect(t1.getLeaves()[0]["persistencePath"].toString()).toBe("TheTreeCollection[tree1].leaves|leaf11");
    });

    it("serializes basic objects", function(){
        var t1:Tests.TestPerson = new Tests.TestPerson("tp1");
        t1.phoneNumber = new Tests.TestPhoneNumber("12345");
        var doc = new DeSerializer.Serializer( new persistence.MeteorObjectRetriever() ).toDocument(t1);
        expect(doc._id).toBe("tp1");
        expect(doc["phoneNumber"]["number"]).toBe("12345");
    });

    it("deserializes basic objects", function(){
        var serializer:DeSerializer.Serializer = new DeSerializer.Serializer( new persistence.MeteorObjectRetriever() );
        var t1:Tests.TestPerson = new Tests.TestPerson("tp1");
        t1.phoneNumber = new Tests.TestPhoneNumber("12345");
        var doc = serializer.toDocument(t1);
        var t1:Tests.TestPerson = serializer.toObject(doc, Tests.TestPerson);
        expect(t1.getId()).toBe("tp1");
        expect(t1.phoneNumber instanceof Tests.TestPhoneNumber).toBeTruthy();
        expect(t1.phoneNumber.getNumber()).toBe("12345");
    });

    it("deserializes objects that have subobjects", function(){
        var serializer:DeSerializer.Serializer = new DeSerializer.Serializer( new persistence.MeteorObjectRetriever() );
        var t1:Tests.TestTree = new Tests.TestTree(123);
        t1.setId("t1");
        t1.grow();
        var doc = serializer.toDocument(t1);
        var t1:Tests.TestTree = serializer.toObject(doc, Tests.TestTree);
        expect(t1.getId()).toBe("t1");
        expect(t1.getLeaves()[0] instanceof Tests.TestLeaf).toBeTruthy();
    });

    it("can call wrapped functions", function(done){
        treeCollection.newTree(24,function(err:any,t:Tests.TestTree){
            t.grow();
            t.grow();
            expect(treeCollection.getById(t.getId())).toBeDefined();
            expect(treeCollection.getById(t.getId()).getLeaves().length).toBe(2);
            expect(treeCollection.getById(t.getId()).getLeaves()[0] instanceof Tests.TestLeaf).toBeTruthy();
            expect(treeCollection.getById(t.getId()).getLeaves()[1] instanceof Tests.TestLeaf).toBeTruthy();
            done();
        });
    });

    it("reoves all", function(){
        expect(true).toBeTruthy();
    });
    // test that properties that need lazy loading are not loaded during serialization
    //
    //it("can use persistence paths on objects that have foreign key properties", function(){
    //    var t1:Tests.TestTree = new Tests.TestTree("tree1");
    //    var tp:Tests.TestPerson = new Tests.TestPerson("tp");
    //    tp.tree = t1;
    //    persistence.MeteorPersistence.updatePersistencePaths(tp);
    //});
    //
    //it("can serialize objects that have foreign key properties", function(){
    //    var t1:Tests.TestTree = new Tests.TestTree("tree1");
    //    var tp:Tests.TestPerson = new Tests.TestPerson("tp");
    //    tp.tree = t1;
    //    var doc = DeSerializer.Serializer.toDocument(tp);
    //    expect( doc["tree"] ).toBe("TheTreeCollection[tree1]");
    //});
    //
    //it("lazy loads objects", function(){
    //    var t1:Tests.TestTree = new Tests.TestTree("tree1");
    //    treeCollection.insert(t1);
    //    var tp:Tests.TestPerson = new Tests.TestPerson("tp");
    //    tp.tree = t1;
    //    personCollection.insert(tp);
    //    var tp2 = personCollection.getById("tp");
    //    expect( persistence.MeteorPersistence.needsLazyLoading(tp2, "tree") ).toBeTruthy();
    //    var trt = tp2.tree;
    //    expect( trt ).toBeDefined();
    //    expect( persistence.MeteorPersistence.needsLazyLoading(tp2, "tree") ).toBeFalsy();
    //});
    //
    //it("can save objects that have foreign key properties", function(){
    //    var t1:Tests.TestTree = new Tests.TestTree("tree1");
    //    treeCollection.insert(t1);
    //    var tp:Tests.TestPerson = new Tests.TestPerson("tp");
    //    tp.tree = t1;
    //    personCollection.insert(tp);
    //    expect(personCollection.getById("tp")).toBeDefined();
    //    expect(personCollection.getById("tp").tree).toBeDefined();
    //});
    //
    //it("XXXXXX can save an array of foreign ids", function(){
    //    var p1:Tests.TestPerson = new Tests.TestPerson("p1");
    //
    //    var t1:Tests.TestTree = new Tests.TestTree("t1");
    //    treeCollection.insert(t1);
    //    var t2:Tests.TestTree = new Tests.TestTree("t2");
    //    treeCollection.insert(t2);
    //    var t3:Tests.TestTree = new Tests.TestTree("t3");
    //    treeCollection.insert(t3);
    //
    //    p1.trees.push(t1);
    //    p1.trees.push(t2);
    //    p1.trees.push(t3);
    //    personCollection.insert(p1);
    //
    //    expect(personCollection.getById("p1").trees).toBeDefined();
    //    expect(Array.isArray( personCollection.getById("p1").trees )).toBeTruthy();
    //    expect( personCollection.getById("p1").trees[1].getId()).toBe("t2");
    //});
    //
    //it("can save objects that have subobjects which are subobjects of other root objects", function(){
    //    var t1:Tests.TestTree = new Tests.TestTree("tree1");
    //    treeCollection.insert(t1);
    //    t1.grow();
    //    var tp:Tests.TestPerson = new Tests.TestPerson("tp");
    //    tp.tree = t1;
    //    personCollection.insert(tp);
    //    tp.collectLeaf();
    //    expect(personCollection.getById("tp").leaf).toBeDefined();
    //    expect(personCollection.getById("tp").leaf.getId()).toBe(t1.getLeaves()[0].getId());
    //});
    //
    //it("can save objects that have subobjects which are one of many elements in a subobject-array of another root object", function(){
    //    var t1:Tests.TestTree = new Tests.TestTree("tree1");
    //    treeCollection.insert(t1);
    //
    //    for( var i=0;i<10;i++)
    //        t1.grow();
    //
    //    var tp:Tests.TestPerson = new Tests.TestPerson("tp");
    //    tp.leaf = t1.getLeaves()[5];
    //    personCollection.insert(tp);
    //    expect(personCollection.getById("tp").leaf).toBeDefined();
    //    expect(personCollection.getById("tp").leaf.getId()).toBe(t1.getLeaves()[5].getId());
    //    expect(personCollection.getById("tp").leaf.greenNess).toBe(t1.getLeaves()[5].greenNess);
    //});
    //
    //it("can serialize object in a map", function(){
    //    var tp = new Tests.TestPerson("tp");
    //    tp.phoneBook["klaus"] = new Tests.TestPhoneNumber("121212");
    //    var doc:any = DeSerializer.Serializer.toDocument(tp);
    //
    //    expect( doc ).toBeDefined();
    //    expect( doc.phoneBook ).toBeDefined();
    //    expect( doc.phoneBook["klaus"] ).toBeDefined();
    //    expect( doc.phoneBook["klaus"].number ).toBeDefined();
    //});
    //
    //it("can serialize object in a map as foreign key", function(){
    //    var tp = new Tests.TestPerson("tp");
    //    tp.wood["klaus"] = new Tests.TestTree("t1");
    //    treeCollection.insert(tp.wood["klaus"]);
    //    tp.wood["peter"] = new Tests.TestTree("t2");
    //    treeCollection.insert(tp.wood["peter"]);
    //    var doc:any = DeSerializer.Serializer.toDocument(tp);
    //    expect( doc ).toBeDefined();
    //    expect( doc.wood ).toBeDefined();
    //    expect( doc.wood["klaus"] ).toBeDefined();
    //    expect( doc.wood["klaus"] ).toBe("TestTree[t1]");
    //    expect( doc.wood["peter"] ).toBe("TestTree[t2]");
    //});
    //
    //it("can save foreign keys in a map", function(){
    //    var tp = new Tests.TestPerson("tp");
    //    tp.wood["klaus"] = new Tests.TestTree("t1");
    //    treeCollection.insert(tp.wood["klaus"]);
    //    tp.wood["peter"] = new Tests.TestTree("t2");
    //    treeCollection.insert(tp.wood["peter"]);
    //    expect(tp.wood["peter"] instanceof Tests.TestTree ).toBeTruthy();
    //    personCollection.insert( tp );
    //    expect( personCollection.getById("tp") ).toBeDefined();
    //    expect( personCollection.getById("tp").wood ).toBeDefined();
    //    expect( typeof personCollection.getById("tp").wood ).toBe("object");
    //    expect( personCollection.getById("tp").wood["peter"] ).toBeDefined();
    //    expect( personCollection.getById("tp").wood["peter"] instanceof Tests.TestTree ).toBeTruthy();
    //    expect( personCollection.getById("tp").wood["peter"].getId() ).toBe("t2");
    //});
    //
    //it("can save objects keys in a map", function(){
    //    var tp = new Tests.TestPerson("tp");
    //    tp.phoneBook["ernie"] = new Tests.TestPhoneNumber("333");
    //    tp.phoneBook["cookie monster"] = new Tests.TestPhoneNumber("444");
    //    tp.phoneBook["superman"] = new Tests.TestPhoneNumber("12345");
    //    personCollection.insert( tp );
    //
    //    expect( personCollection.getById("tp") ).toBeDefined();
    //    expect( persistence.MeteorPersistence.needsLazyLoading(personCollection.getById("tp"), "wood")).toBeFalsy();
    //    expect( personCollection.getById("tp").phoneBook ).toBeDefined();
    //    expect( typeof personCollection.getById("tp").phoneBook ).toBe("object");
    //    expect( personCollection.getById("tp").phoneBook["superman"] ).toBeDefined();
    //    expect( personCollection.getById("tp").phoneBook["superman"] instanceof Tests.TestPhoneNumber ).toBeTruthy();
    //    expect( personCollection.getById("tp").phoneBook["superman"].getNumber() ).toBe("12345");
    //});
    //
    //it("can save objects with a dictionary to objects in the same collection", function(){
    //    var kid = new Tests.TestPerson("kid");
    //    var mom = new Tests.TestPerson("mom");
    //    var dad = new Tests.TestPerson("dad");
    //    personCollection.insert(mom);
    //    personCollection.insert(dad);
    //    kid.family["mommy"] = mom;
    //    kid.family["daddy"] = dad;
    //    personCollection.insert( kid );
    //    expect( personCollection.getById("kid").family["mommy"].getId() ).toBe("mom");
    //    expect( personCollection.getById("kid").family["daddy"].getId() ).toBe("dad");
    //});
    //
    //
    //it("can return values from a wrapped function", function(){
    //    var kid = new Tests.TestPerson("kid");
    //    personCollection.insert( kid );
    //    var a = kid.addAddress(new Tests.TestAddress("streetsss"));
    //
    //    expect( a instanceof Tests.TestAddress).toBeTruthy();
    //    expect( a.getStreet() ).toBe("streetsss");
    //});
    //
    //it("stores something as a foreign key turns undefined after the foreign object is deleted", function(){
    //    var t1 = new Tests.TestTree("t1");
    //    treeCollection.insert( t1 );
    //    t1.grow();
    //    var kid = new Tests.TestPerson("kid");
    //    kid.tree = t1;
    //    personCollection.insert( kid );
    //    kid.collectLeaf();
    //    expect( personCollection.getById("kid").leaf ).toBeDefined();
    //    treeCollection.remove(t1);
    //    expect( personCollection.getById("kid").leaf ).toBeUndefined();
    //});
    //
    //
    //it("stores something as a foreign key turns undefined after the foreign sub object is deleted", function(){
    //    var t1 = new Tests.TestTree("t1");
    //    treeCollection.insert( t1 );
    //    t1.grow();
    //    var kid = new Tests.TestPerson("kid");
    //    kid.tree = t1;
    //    personCollection.insert( kid );
    //    kid.collectLeaf();
    //    expect( personCollection.getById("kid").leaf ).toBeDefined();
    //    t1.wither();
    //    expect( personCollection.getById("kid").leaf ).toBeUndefined();
    //});
    //
    //xit("can store a subdocument by id. The subducoment is from a different collection. It is stored in a dictionary on a key that is something else than it's id.", function(){
    //    // the subdocument either needs to have an Id or it is stored by the id in the dictionary.
    //});
    //
    //it("calls registered callbacks that receive results directly from the server ", function(done){
    //    var t1 = new Tests.TestTree("t1");
    //    treeCollection.insert( t1 );
    //    persistence.MeteorPersistence.withCallback(function(){
    //        var s = t1.grow();
    //        expect( s ).toBe("grown on the client");
    //    }, function callback( error, result ){
    //        expect( result ).toBe("grown on the server");
    //        done();
    //    } );
    //});
    //
    //it("sets ids on the server", function(done){
    //    var t1 = new Tests.TestPerson();
    //    t1.name = "Klaus";
    //    personCollection.insert( t1, function(err,p:Tests.TestPerson){
    //        if( err )
    //            fail();
    //        else
    //        {
    //            expect(p).toBeDefined();
    //            setTimeout(function(){
    //                expect(personCollection.getById(p.getId()).name).toBe("Klaus");
    //                expect(p.name).toBe("Klaus");
    //                done();
    //            },1000);
    //        }
    //    } );
    //});
    //
    //it("cannot do two wrapped calls in 'withCallback'", function(done){
    //    var t1 = new Tests.TestTree("t1");
    //    treeCollection.insert( t1 );
    //    var count = 0;
    //    persistence.MeteorPersistence.withCallback(function(){
    //        var s = t1.grow();
    //        var s = t1.grow();
    //    }, function callback( result, error ){
    //        count++;
    //        if( count==2)
    //            done();
    //    } );
    //});
    //
    //it("supports wrapped calls whose last parameter is a callback function.", function(done){
    //    var t1 = new Tests.TestPerson("p1");
    //    t1.phoneBook["mike"] = new Tests.TestPhoneNumber("12345");
    //    personCollection.insert(t1);
    //    var t2 = personCollection.getById("p1");
    //    t2.phoneBook["mike"].callNumber(function(err:any,  r:string){
    //        expect(r).toBe("Called:12345");
    //        done();
    //    });
    //});
    //
    //it("supports wrapped calls whose last parameter is a callback function and has more parameters.", function(done){
    //    var t1 = new Tests.TestPerson("p1");
    //    t1.phoneBook["mike"] = new Tests.TestPhoneNumber("12345");
    //    personCollection.insert(t1);
    //    var t2 = personCollection.getById("p1");
    //    t2.phoneBook["mike"].callNumberFrantically(5, function(err:any,  r:string){
    //        expect(r).toBe("Called:12345 5 time(s)" );
    //        done();
    //    });
    //});
    //
    //xit("offers a way to annotate wrapped calls as 'performed on the server'.", function() {
    //});
    //
    ////xit("Allows to pass objects to wrapped functions'.", function() {
    ////});
    ////
    ////xit("Allows to pass entities to wrapped functions'.", function() {
    ////});
    //
    //xit("can insert Ids on the server.", function() {
    //    var t1 = new Tests.TestPerson();
    //
    //    personCollection.insert(t1);
    //});



// Maps (merge with array, use .Collection("<Entry-ClassName>") annotation for both

// callbacks

// tests

// foreign key arrays with undefined entries
// subdocument arrays with undefined entries
// wrapped function results
// test that something stored as a foreign key (both sub and root) turns undefined after the foreign root is deleted



// store smart objects in dumb objects ?

    // foreign key arrays with undefined entries
    // subdocument arrays with undefined entries
    // wrapped function results
    // test that something stored as a foreign key (both sub and root) turns undefined after the foreign root is deleted

});
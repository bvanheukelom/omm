///<reference path="../../../../references.d.ts"/>

describe("The persistence thing on the client ", function(){
    var personCollection:Tests.TestPersonCollection;
    var treeCollection:Tests.TestTreeCollection;
    beforeAll(function(){
        personCollection = new Tests.TestPersonCollection();
        treeCollection = new Tests.TestTreeCollection();
    });


    beforeEach(function(done){
        console.log("------------------- new test");
        omm.Collection.resetAll(function(error){
            if (error)
                fail(error);
            done();
        });
    });


    it("can call wrapped functions", function(done){
        var c = 0;
        treeCollection.newTree(24,function(err:any,t:Tests.TestTree){
            c++;
            expect(c).toBe(1);
            omm.MeteorPersistence.withCallback(function(){
                c++;
                expect(c).toBe(2);
                t.grow();

            }, function(){
                c++;
                expect(c).toBe(3);
                //expect(treeCollection.getById(t.getId())).toBeDefined();
                expect(treeCollection.getById(t.treeId).getLeaves().length).toBe(1);
                expect(treeCollection.getById(t.treeId).getLeaves()[0] instanceof Tests.TestLeaf).toBeTruthy();
                done();
            });
        });
    });

    it("can return values from a wrapped function", function(done){
        personCollection.newPerson("Held", function(e:any, held:Tests.TestPerson) {
            omm.MeteorPersistence.withCallback(function(){
                held.addAddress(new Tests.TestAddress("streetsss"));
            }, function(e:any, a:Tests.TestAddress){
                expect( a instanceof Tests.TestAddress).toBeTruthy();
                expect( a.getStreet() ).toBe("streetsss");
                done();
            });
        });
    });

    it("serializes and deserializes classes with a custom toDocument and toObject function properly", function(){
        var pn = new Tests.TestPhoneNumber("1212");
        var s = new omm.Serializer(new omm.ConstantObjectRetriever(1));
        var doc:any = s.toDocument(pn);
        expect( doc.freak ).toBe("show");
        expect( doc.pn ).toBe("1212");
        var ob = s.toObject(doc, Tests.TestPhoneNumber);
        expect( ob instanceof Tests.TestPhoneNumber ).toBeTruthy();

    });

    it("calls registered callbacks that receive results from the server ", function(done){
        treeCollection.newTree(24,function(err:any,t1:Tests.TestTree) {
            omm.MeteorPersistence.withCallback(function () {
                var s = t1.grow();
                expect(s).toBeUndefined();
            }, function callback(error, result) {
                expect(result).toBe("grown on the server");
                done();
            });
        });
    });

    it("can call wrapped functions on a subobject", function(done){
        personCollection.newPerson("bert", function(error:any, bert:Tests.TestPerson){
            expect(error).toBeFalsy();
            omm.MeteorPersistence.withCallback(function(){
                bert.addPhoneNumber("max", new Tests.TestPhoneNumber("1234567890"));

            }, function(){
                expect(personCollection.getById(bert.getId()).phoneBook["max"]).toBeDefined();
                omm.MeteorPersistence.withCallback(function() {
                    personCollection.getById(bert.getId()).phoneBook["max"].callNumber();
                },function(err, result){
                    expect( result ).toBe("Calling a phone number : 1234567890");
                    expect(personCollection.getById(bert.getId()).phoneBook["max"]).toBeDefined();
                    done();
                });
            });
        } );
    });


    it("does not lazy load objects within the same root object", function(done){
        personCollection.newPerson("Held", function(e:any, held:Tests.TestPerson){
            omm.MeteorPersistence.withCallback(function(){
                held.addAddress( new Tests.TestAddress("streetname", held));

            }, function(){
                var loadedHeld = personCollection.getById(held.getId());
                expect(loadedHeld.getAddresses()[0]).toBeDefined();
                expect(omm.Serializer.needsLazyLoading(loadedHeld.getAddresses()[0], "person")).toBeFalsy();
                expect(loadedHeld.getAddresses()[0].person==loadedHeld).toBeTruthy();
                done();
            });
        });
    });

    it("lazy loads objects", function(done){
        personCollection.newPerson( "jake", function( error:any, jake:Tests.TestPerson ){
            treeCollection.newTree(12, function( error, t:Tests.TestTree ){
                omm.MeteorPersistence.withCallback(function(){
                    jake.chooseTree(t);
                }, function(){
                    var loadedJake = personCollection.getById(jake.getId());
                    expect(loadedJake).toBeDefined();
                    expect((<any>loadedJake)._tree).toBeDefined();
                    expect(omm.Serializer.needsLazyLoading(loadedJake, "tree") ).toBeTruthy();
                    //loadedJake.tree;
                    //expect(mapper.MeteorPersistence.needsLazyLoading(loadedJake, "tree") ).toBeFalsy();
                    done();
                });
            });
        });
    });

    it("doesnt die if a wrapped call calls another wrapped call within a different collection", function(done){

        personCollection.newPerson("mike", function(e:any, p:Tests.TestPerson){
            treeCollection.newTree( 13, function(e:any, t:Tests.TestTree){
                omm.MeteorPersistence.withCallback(function(){
                    p.chooseTree(t);
                }, function(){
                    omm.MeteorPersistence.withCallback(function(){
                        personCollection.getById(p.getId()).tendToGarden();
                    }, function(err:any, result:number ){
                        expect(result).toBe(14); // tree grew on the server
                        expect(treeCollection.getById(t.treeId).getHeight()).toBe(13); // but that "growing" wasnt persited
                        done();
                    });
                });
            });
        });
    });

    it("knows static meteor method annotations that have parameters", function(){
        var m:IMethodOptions = omm.PersistenceAnnotation.getMethodOptions('helloWorld');
        expect(m).toBeDefined();
        expect(m.name).toBe("helloWorld");
        expect(m.functionName).toBe('staticInsertPerson2');
        expect(m.isStatic).toBeTruthy();
        expect(m.object).toBe(Tests.TestPersonCollection);
        expect(m.parameterTypes[0]).toBe('string');
    });

    it("knows static meteor method annotations ", function(){
        var m:IMethodOptions = omm.PersistenceAnnotation.getMethodOptions('TestPersonCollection-staticInsertPerson');
        expect(m).toBeDefined();
        expect(m.name).toBe("TestPersonCollection-staticInsertPerson");
        expect(m.functionName).toBe('staticInsertPerson');
        expect(m.isStatic).toBeTruthy();
        expect(m.object).toBe(Tests.TestPersonCollection);
        expect(m.parameterTypes).toBeUndefined();
    });

    it("can insert a person using a call ", function(done){
        omm.call("TestPersonCollection-insertPerson", 'hello', function(error,result:Tests.TestPerson){
            expect( result instanceof Tests.TestPerson ).toBeTruthy();
            expect( result.getName() ).toBe("hello");
            done();
        });
    });

    it("can insert a person using a call helper to a static function ", function(done){
        omm.staticCallHelper(Tests.TestPersonCollection,  function(error,result:Tests.TestPerson){
            expect( result instanceof Tests.TestPerson ).toBeTruthy();
            expect( result.getName() ).toBe("hello");
            done();
        }).staticInsertPerson("hello");
    });

    it("can insert a person using a call to a static function ", function(done){
        omm.call("TestPersonCollection-staticInsertPerson", "hiho", function(error,result:Tests.TestPerson){
            expect( result instanceof Tests.TestPerson ).toBeTruthy();
            expect( result.getName() ).toBe("hiho");
            done();
        });
    });


    it("can insert a person using a helper ", function(done){
        omm.callHelper(personCollection, function(error,result){
            expect( result instanceof Tests.TestPerson ).toBeTruthy();
            done();
        }).insertPerson('hello');
    });

    it("can update a person using a helper ", function(done){
        omm.staticCallHelper(Tests.TestPersonCollection,  function(error,result:Tests.TestPerson){
            expect( error ).toBeUndefined();
            if( !error ){
                omm.callHelper(result, function(err,r2){
                    if( !err ) {
                        expect(err).toBeUndefined();
                        var n = personCollection.getById(result.getId());
                        expect(n.getName()).toBe("bert");
                    }
                    done();
                }).rename("bert");
            }
            else
                done();
        }).staticInsertPerson("hello");
    });

    fit("can update a person using a meteor call ", function(done){
        omm.staticCallHelper(Tests.TestPersonCollection,  function(error,result:Tests.TestPerson){
            expect( error ).toBeUndefined();
            debugger
            Meteor.call('TestPerson-rename', result.getId(), "max", function(err, res:string){
                expect(err).toBeUndefined();
                expect(res).toBe("max");
                expect(personCollection.getById(result.getId()).getName()).toBe("max");
                done();
            });
        }).staticInsertPerson("hello");
    });


});
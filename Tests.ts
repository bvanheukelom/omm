///<reference path="references.d.ts"/>

import TestPersonCollection = require("./TestPersonCollection");
import BaseCollection = require("./BaseCollection");
import TestTree = require("./TestTree");
import TestPerson = require("./TestPerson");
import TestLeaf = require("./TestLeaf");
import TestPhoneNumber = require("./TestPhoneNumber");
import MeteorPersistence = require("./MeteorPersistence");
import PersistenceAnnotation = require("./PersistenceAnnotation");
import Serializer = require("./Serializer");

describe("The persistence thing", function(){
    var personCollection:TestPersonCollection;
    var treeCollection:BaseCollection<TestTree>;
    beforeAll(function(){
        personCollection = new TestPersonCollection();
        treeCollection = new BaseCollection<TestTree>(TestTree);
    });

    afterEach(function(){
        personCollection.getAll().forEach(function(person:TestPerson){
            personCollection.remove(person);
        });
        treeCollection.getAll().forEach(function(tree:TestTree){
            treeCollection.remove(tree);
        });
    });

    it( "knows the difference between root entities and subdocument entities ", function(){
        expect( PersistenceAnnotation.isRootEntity(TestPerson) ).toBeTruthy();
        expect( PersistenceAnnotation.isRootEntity(TestTree) ).toBeTruthy();
        expect( PersistenceAnnotation.isRootEntity(TestLeaf) ).toBeFalsy();
    });

    it("can do basic inserts", function(){
        var t1:TestTree = new TestTree("tree1");
        treeCollection.insert(t1);
        expect( treeCollection.getById("tree1")).toBeDefined();
        expect( treeCollection.getById("tree1").getId()).toBe("tree1");
    });

    it("can do basic removes", function(){
        var t1:TestTree = new TestTree("tree1");
        treeCollection.insert(t1);
        expect( treeCollection.getById("tree1")).toBeDefined();
        treeCollection.remove(t1);
        expect( treeCollection.getById("tree1")).toBeUndefined();
    });

    it("uses persistence paths on root documents", function(){
        var t1:TestTree = new TestTree("tree1");
        t1.grow();
        MeteorPersistence.updatePersistencePaths(t1);
        expect(t1["persistencePath"]).toBeDefined();
        expect(t1["persistencePath"].toString()).toBe("TestTree[tree1]");
    });

    it("uses persistence paths on sub documents", function(){
        var tp:TestPerson = new TestPerson("tp1");
        tp.phoneNumber = new TestPhoneNumber("12345");
        MeteorPersistence.updatePersistencePaths(tp);
        expect(tp.phoneNumber["persistencePath"]).toBeDefined();
        expect(tp.phoneNumber["persistencePath"].toString()).toBe("TestPerson[tp1].phoneNumber");
    });

    it("uses persistence paths on subdocuments in arrays", function(){
        var t1:TestTree = new TestTree("tree1");
        t1.grow();
        MeteorPersistence.updatePersistencePaths(t1);
        expect(t1.getLeaves()[0]["persistencePath"]).toBeDefined();
        expect(t1.getLeaves()[0]["persistencePath"].toString()).toBe("TestTree[tree1].leaves.leaf11");
    });

    it("serializes basic objects", function(){
        var t1:TestPerson = new TestPerson("tp1");
        t1.phoneNumber = new TestPhoneNumber("12345");
        var doc = Serializer.toDocument(t1);
        expect(doc._id).toBe("tp1");
        expect(doc["phoneNumber"]["number"]).toBe("12345");
    });

    it("deserializes basic objects", function(){
        var t1:TestPerson = new TestPerson("tp1");
        t1.phoneNumber = new TestPhoneNumber("12345");
        var doc = Serializer.toDocument(t1);
        var t1:TestPerson = Serializer.toObject(doc, TestPerson);
        expect(t1.getId()).toBe("tp1");
        expect(t1.phoneNumber instanceof TestPhoneNumber).toBeTruthy();
        expect(t1.phoneNumber.getNumber()).toBe("12345");
    });
    it("deserializes objects that have subobjects", function(){
        var t1:TestTree = new TestTree("t1");
        t1.grow();
        var doc = Serializer.toDocument(t1);
        var t1:TestTree = Serializer.toObject(doc, TestTree);
        expect(t1.getId()).toBe("t1");
        expect(t1.getLeaves()[0] instanceof TestLeaf).toBeTruthy();
    });

    it("can load objects that have subobjects", function(){
        var t1:TestPerson = new TestPerson("t");
        t1.phoneNumber = new TestPhoneNumber("1212")
        personCollection.insert(t1);
        expect(personCollection.getById("t")).toBeDefined();
        expect(personCollection.getById("t").phoneNumber instanceof TestPhoneNumber).toBeTruthy();
    });

    it("can load objects that have subobjects (in an array) which have a parent reference", function(){
        var t1:TestTree = new TestTree("tree1");
        t1.grow();
        treeCollection.insert(t1);
        expect(treeCollection.getById("tree1")).toBeDefined();
        expect(treeCollection.getById("tree1").getLeaves()[0] instanceof TestLeaf).toBeTruthy();
    });

    it("can remove objects that have subobjects", function(){
        var t1:TestTree = new TestTree("tree1");
        t1.grow();
        treeCollection.insert(t1);
        expect(treeCollection.getById("tree1")).toBeDefined();
        expect(treeCollection.getById("tree1").getLeaves()[0] instanceof TestLeaf).toBeTruthy();
    });

    it("can call wrapped functions", function(){
        var t1:TestTree = new TestTree("tree1");
        treeCollection.insert(t1);
        t1.grow();
        expect(treeCollection.getById("tree1")).toBeDefined();
        expect(treeCollection.getById("tree1").getLeaves()[0] instanceof TestLeaf).toBeTruthy();
    });

    it("can use persistence paths on objects that have foreign key properties", function(){
        var t1:TestTree = new TestTree("tree1");
        var tp:TestPerson = new TestPerson("tp");
        tp.tree = t1;
        MeteorPersistence.updatePersistencePaths(tp);
    });

    it("can serialize objects that have foreign key properties", function(){
        var t1:TestTree = new TestTree("tree1");
        var tp:TestPerson = new TestPerson("tp");
        tp.tree = t1;
        var doc = Serializer.toDocument(tp);
        expect( doc["tree"] ).toBe("TestTree[tree1]");
    });


    it("lazy loads objects", function(){
        var t1:TestTree = new TestTree("tree1");
        var tp:TestPerson = new TestPerson("tp");
        tp.tree = t1;
        personCollection.insert(tp);
        var tp2 = personCollection.getById("tp");
        expect( MeteorPersistence.needsLazyLoading(tp2, "tree") ).toBeTruthy();
        tp2.tree;
        expect( MeteorPersistence.needsLazyLoading(tp2, "tree") ).toBeFalsy();
    });

    it("can save objects that have foreign key properties", function(){
        var t1:TestTree = new TestTree("tree1");
        treeCollection.insert(t1);
        var tp:TestPerson = new TestPerson("tp");
        tp.tree = t1;
        personCollection.insert(tp);
        expect(personCollection.getById("tp")).toBeDefined();
        expect(personCollection.getById("tp").tree).toBeDefined();
    });

    it("can save objects that have subobjects which are subobjects of other root objects", function(){
        var t1:TestTree = new TestTree("tree1");
        treeCollection.insert(t1);
        t1.grow();
        var tp:TestPerson = new TestPerson("tp");
        tp.tree = t1;
        personCollection.insert(tp);
        tp.collectLeaf();
        expect(personCollection.getById("tp").leaf).toBeDefined();
        expect(personCollection.getById("tp").leaf.getId()).toBe(t1.getLeaves()[0].getId());
    });

    //it("can save objects that have subobjects which are subobjects of other root objects", function(){
    //    var t1:TestTree = new TestTree("tree1");
    //    treeCollection.insert(t1);
    //    t1.grow();
    //    var tp:TestPerson = new TestPerson("tp");
    //    tp.tree = t1;
    //    personCollection.insert(tp);
    //    tp.collectLeaf();
    //    expect(personCollection.getById("tp").leaf).toBeDefined();
    //    expect(personCollection.getById("tp").leaf.getId()).toBe(t1.getLeaves()[0].getId());
    //});




});
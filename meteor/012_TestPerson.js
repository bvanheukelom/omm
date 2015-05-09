if (typeof __decorate !== "function") __decorate = function (decorators, target, key, desc) {
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") return Reflect.decorate(decorators, target, key, desc);
    switch (arguments.length) {
        case 2: return decorators.reduceRight(function(o, d) { return (d && d(o)) || o; }, target);
        case 3: return decorators.reduceRight(function(o, d) { return (d && d(target, key)), void 0; }, void 0);
        case 4: return decorators.reduceRight(function(o, d) { return (d && d(target, key, o)) || o; }, desc);
    }
};
/**
 * Created by bert on 04.05.15.
 */
TestPerson = (function () {
    function TestPerson(id, name) {
        this.phoneNumbers = [];
        this.addresses = [];
        this._id = id;
        this.name = name;
        console.log("");
    }
    TestPerson.prototype.getId = function () {
        return this._id;
    };
    TestPerson.prototype.addAddress = function (a) {
        console.log("inside add address:", (a instanceof TestAddress));
        this.addresses.push(a);
    };
    TestPerson.prototype.rename = function (n) {
        this.name = n;
    };
    TestPerson.prototype.getTrees = function () {
        return this.trees;
    };
    TestPerson.prototype.getName = function () {
        return this.name;
    };
    TestPerson.prototype.addPhoneNumber = function (n) {
        this.phoneNumbers.push(new TestPhoneNumber(n, this));
    };
    //getAddressById(id:String):TestAddress
    //{
    //    for( var i=0;i<this.addresses.length; i++ )
    //    {
    //        var address = this.addresses[i];
    //        if( address.getId()==id )
    //            return address;
    //    }
    //}
    TestPerson.prototype.getAddresses = function () {
        return this.addresses;
    };
    TestPerson.prototype.getTree = function () {
        return this.tree;
    };
    TestPerson.prototype.callPhoneNumber = function (number) {
        this.phoneNumbers.forEach(function (pn) {
            if (pn.getNumber() == number)
                pn.called();
        });
    };
    TestPerson.prototype.collectLeaf = function () {
        this.leaf = this.tree.getLeaves()[0];
    };
    __decorate([
        PersistenceAnnotation.Type("TestPhoneNumber")
    ], TestPerson.prototype, "phoneNumbers");
    __decorate([
        PersistenceAnnotation.Type("TestAddress")
    ], TestPerson.prototype, "addresses");
    __decorate([
        PersistenceAnnotation.Type("TestTree"),
        PersistenceAnnotation.AsForeignKeys
    ], TestPerson.prototype, "tree");
    Object.defineProperty(TestPerson.prototype, "addAddress",
        __decorate([
            PersistenceAnnotation.Wrap
        ], TestPerson.prototype, "addAddress", Object.getOwnPropertyDescriptor(TestPerson.prototype, "addAddress")));
    Object.defineProperty(TestPerson.prototype, "collectLeaf",
        __decorate([
            PersistenceAnnotation.Wrap
        ], TestPerson.prototype, "collectLeaf", Object.getOwnPropertyDescriptor(TestPerson.prototype, "collectLeaf")));
    TestPerson = __decorate([
        PersistenceAnnotation.Entity
    ], TestPerson);
    return TestPerson;
})();

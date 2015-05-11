///<reference path="references.d.ts"/>
@persistence.PersistenceAnnotation.Entity(true)
class TestPerson
{
    name:string;
    _id:string;

    @persistence.PersistenceAnnotation.Type("TestPhoneNumber")
    phoneNumber:TestPhoneNumber;

    @persistence.PersistenceAnnotation.ArrayOrMap("TestAddress")
    private addresses:Array<TestAddress> = [];

    @persistence.PersistenceAnnotation.Type("TestTree")
    @persistence.PersistenceAnnotation.AsForeignKeys
    tree:TestTree;

    @persistence.PersistenceAnnotation.Type("TestLeaf")
    @persistence.PersistenceAnnotation.AsForeignKeys
    leaf:TestLeaf;

    @persistence.PersistenceAnnotation.ArrayOrMap("TestLeaf")
    @persistence.PersistenceAnnotation.AsForeignKeys
    trees:Array<TestTree> = [];

    @persistence.PersistenceAnnotation.ArrayOrMap("TestPhoneNumber")
    phoneBook:{ [index:string]: TestPhoneNumber } = {};

    @persistence.PersistenceAnnotation.ArrayOrMap("TestTree")
    @persistence.PersistenceAnnotation.AsForeignKeys
    wood:{ [index:string]: TestTree } = {};

    constructor(id?:string, name?:string)
    {
        this._id = id;
        this.name = name;
    }

    getId():string
    {
        return this._id;
    }

    @persistence.PersistenceAnnotation.Wrap
    addAddress(a:TestAddress):void
    {
        console.log("inside add address:", (a instanceof TestAddress));
        this.addresses.push(a);
    }

    rename(n:string):void
    {
        this.name = n;
    }

    getName():string
    {
        return this.name;
    }


    //getAddressById(id:String):TestAddress
    //{
    //    for( var i=0;i<this.addresses.length; i++ )
    //    {
    //        var address = this.addresses[i];
    //        if( address.getId()==id )
    //            return address;
    //    }
    //}

    getAddresses():Array<TestAddress>
    {
        return this.addresses;
    }

    getTree():TestTree
    {
        return this.tree;
    }


    @persistence.PersistenceAnnotation.Wrap
    collectLeaf()
    {
        this.leaf = this.tree.getLeaves()[0];
    }

}



///<reference path="references.d.ts"/>
module Tests
{
    @persistence.PersistenceAnnotation.Entity(true)
    export class TestPerson
    {
        name:string;
        _id:string;

        @persistence.PersistenceAnnotation.Type("TestPhoneNumber")
        phoneNumber:Tests.TestPhoneNumber;

        @persistence.PersistenceAnnotation.ArrayOrMap("TestAddress")
        private addresses:Array<TestAddress> = [];

        @persistence.PersistenceAnnotation.Type("TestTree")
        @persistence.PersistenceAnnotation.AsForeignKeys
        tree:Tests.TestTree;

        @persistence.PersistenceAnnotation.Type("TestLeaf")
        @persistence.PersistenceAnnotation.AsForeignKeys
        leaf:Tests.TestLeaf;

        @persistence.PersistenceAnnotation.ArrayOrMap("TestLeaf")
        @persistence.PersistenceAnnotation.AsForeignKeys
        trees:Array<Tests.TestTree> = [];

        @persistence.PersistenceAnnotation.ArrayOrMap("TestPhoneNumber")
        phoneBook:{ [index:string]: Tests.TestPhoneNumber } = {};

        @persistence.PersistenceAnnotation.ArrayOrMap("TestTree")
        @persistence.PersistenceAnnotation.AsForeignKeys
        wood:{ [index:string]: Tests.TestTree } = {};


        @persistence.PersistenceAnnotation.ArrayOrMap("TestPerson")
        @persistence.PersistenceAnnotation.AsForeignKeys
        family:{ [index:string]: Tests.TestPerson } = {};


        constructor(id?:string, name?:string)
        {
            this._id = id;
            this.name = name;
        }

        getId():string
        {
            return this._id;
        }

        setId( id:string ):void
        {
            this._id = id;
        }


        @persistence.PersistenceAnnotation.Wrap
        addAddress(a:TestAddress):Tests.TestAddress
        {
            console.log("inside add address:", (a instanceof TestAddress));
            this.addresses.push(a);
            return a;
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
            console.log("collecting leaf:",this.tree);
            this.leaf = this.tree.getLeaves()[0];
        }

        @persistence.PersistenceAnnotation.Wrap
        chooseTree(t:TestTree)
        {
            console.log("choosing tree:",t);
            this.tree = t;
        }
        @persistence.PersistenceAnnotation.Wrap
        chooseLeaf(l:TestLeaf)
        {
            this.leaf = l;
        }
        @persistence.PersistenceAnnotation.Wrap
        addToWood(t:TestTree, s?:string )
        {
            this.trees.push( t );
            if( s )
                this.wood[s] = t;
        }

        @persistence.PersistenceAnnotation.Wrap
        addFamilyRelation(s:string, p:Tests.TestPerson )
        {
            if( s )
                this.family[s] = p;
        }

        @persistence.PersistenceAnnotation.Wrap
        addPhoneNumber(s:string, p:Tests.TestPhoneNumber )
        {
            this.phoneBook[s] = p;
        }


    }
}

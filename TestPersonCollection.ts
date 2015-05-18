///<reference path="references.d.ts"/>
class TestPersonCollection extends persistence.BaseCollection<Tests.TestPerson>
{
    constructor()
    {
        super(Tests.TestPerson);
    }
    newPerson( n:string, callback:(err:any, tree?:Tests.TestPerson)=>void):void{
        var p:Tests.TestPerson  = new Tests.TestPerson();
        p.name = n;
        var that = this;
        this.insert(p, function(e:any, id:string){
            callback(e, id?that.getById(id):undefined);
        });
    }

    haveBaby(mom:Tests.TestPerson, dad:Tests.TestPerson, callback:(err:any, p?:Tests.TestPerson)=>void):void
    {
        console.log("mom: ",mom);
        console.log("dad: ",dad);
        var kid:Tests.TestPerson = new Tests.TestPerson();
        kid.name = "child of "+mom.name+" and "+dad.name;
        kid.family["mom"]=mom;
        kid.family["dad"]=dad;
        var that = this;
        this.insert(kid, function(e:any, id:string){
            console.log("The baby is inserted into the database");
            callback(e, id?that.getById(id):undefined);
        });
    }
}

if( Meteor.isServer ) {
    Meteor.publish("persons", function(){
        return persistence.MeteorPersistence.collections["TestPerson"].getMeteorCollection().find({});
    });
}
else
{
    Meteor.subscribe("persons");
}

persistence.MeteorPersistence.wrapFunction(TestPersonCollection.prototype, "newPerson", "newPerson", true, new DeSerializer.Serializer(new persistence.MeteorObjectRetriever()), new persistence.ConstantObjectRetriever(new TestPersonCollection()) );
persistence.MeteorPersistence.wrapFunction(TestPersonCollection.prototype, "haveBaby", "haveBaby", true, new DeSerializer.Serializer(new persistence.MeteorObjectRetriever()), new persistence.ConstantObjectRetriever(new TestPersonCollection()) );

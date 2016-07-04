
import * as omm from "../../src/omm"
import * as Tests from "./Tests"

export class TestPersonCollection extends omm.Collection<Tests.TestPerson> {
    constructor() {
        super(Tests.TestPerson);
        omm.registerObject( "TestPersonCollection", this);
    }

    @omm.MeteorMethod({ serverOnly:true, parameterTypes:["string","callback"]})
    newPerson(n:string):Promise<Tests.TestPerson> {
        var p:Tests.TestPerson = new Tests.TestPerson();
        p.name = n;
        return this.insert(p).then((id:string)=>{
            return this.getById(id);
        });
    }

    // @omm.MeteorMethod({object:'TestPersonCollection'})
    // insertPerson(n:string):Tests.TestPerson {
    //     var p:Tests.TestPerson = new Tests.TestPerson();
    //     p.name = n;
    //     var that = this;
    //     var id = this.insert(p);
    //     return this.getById(id);
    // }

    @omm.MeteorMethod({  parameterTypes:["TestPerson", "TestPerson", "callback"]})
    haveBaby( mom:Tests.TestPerson, dad:Tests.TestPerson ):Promise<Tests.TestPerson> {
        //console.log("mom: ", mom);
        //console.log("dad: ", dad);
        var kid:Tests.TestPerson = new Tests.TestPerson();
        kid.name = "child of " + mom.name + " and " + dad.name;
        kid.family["mom"] = mom;
        kid.family["dad"] = dad;
        return this.insert(kid).then((id:string)=>{
            return this.getById(id);
        });
    }

    @omm.MeteorMethod({  serverOnly:true, parameterTypes:["string", "callback"]})
    removePerson( id:string ) : Promise<void> {
        return this.remove(id);
    }

    @omm.MeteorMethod({ serverOnly:true, parameterTypes:["callback"]})
    removeAllPersons( ) : Promise<void> {
        return this.getMeteorCollection().remove({});
    }

}

// omm.registerObject('TestPersonCollection', new TestPersonCollection());


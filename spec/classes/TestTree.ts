import * as omm from "../../src/omm"
import * as Tests from "./Tests"
@omm.Entity//("TheTreeCollection")
export class TestTree {
    @omm.Id
    treeId:string;
    private height:number = 10;
    someArray:Array<any> = [];
    creationDate:Date;

    @omm.ArrayType("TestLeaf")
    @omm.DocumentName('thoseGreenThings')
    leaves:Array<Tests.TestLeaf> = [];

    @omm.Type("TestAddress")
    // @omm.AsForeignKey
    address:Tests.TestAddress; // this cant be stored as the address doesnt have a foreign key

    constructor( initialHeight?:number) {
        this.height = initialHeight || 10;
        this.creationDate = new Date();
    }

    @omm.Wrap
    grow():string {
        return this._grow();
    }

    _grow():string {
        this.height++;
        //console.log("Tree is growing to new heights: ", this.height+" on the "+(omm.getMeteor().isServer?"server":"client"));
        this.leaves.push(new Tests.TestLeaf("leaf" + this.getHeight(), this));
        this.leaves.forEach(function (l:Tests.TestLeaf) {
            l.grow();
        });
        return "grown!";
    }

    @omm.CollectionUpdate
    growAsOnlyACollectionUpdate():string {
        return this._grow();
    }

    @omm.Wrap
    wither() {
        this.leaves = [];
        omm.emit("gardenevents", "withered");
        omm.emit("gardenevents", "withered2");
    }

    @omm.Wrap
    thisThrowsAnError() {
        throw new Error("Hello world");
    }

    getHeight():number {
        return this.height;
    }

    getLeaves():Array<Tests.TestLeaf> {
        return this.leaves;
    }

    @omm.CollectionUpdate
    @omm.MeteorMethod({replaceWithCall:true, resultType:"TestLeaf"})
    growAndReturnLeaves():Array<Tests.TestLeaf>{
        this.grow();
        return this.leaves;
    }
}
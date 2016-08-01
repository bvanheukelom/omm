import * as omm from "../../src/omm"
import * as Tests from "./Tests"

@omm.Entity
export class TestInheritanceParent {
    @omm.Type("TestInheritanceOther")
    parentOther : Tests.TestInheritanceOther;

    @omm.Type("TestPerson")
    // @omm.AsForeignKey
    person : Tests.TestPerson;

    parentness:number;

    @omm.Ignore
    ignoredOther : Tests.TestInheritanceOther;
}

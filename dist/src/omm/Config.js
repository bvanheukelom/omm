/**
 * Created by bert on 22.03.16.
 */
"use strict";
var PersistenceAnnotation_1 = require("../annotations/PersistenceAnnotation");
function config(options) {
    if (options.Meteor)
        PersistenceAnnotation_1.environmentReferences.meteorReference = options.Meteor;
    if (options.Mongo) {
        PersistenceAnnotation_1.environmentReferences.mongoReference = options.Mongo;
    }
}
exports.config = config;
function getMeteor() {
    return PersistenceAnnotation_1.environmentReferences.meteorReference;
}
exports.getMeteor = getMeteor;
function getMongo() {
    return PersistenceAnnotation_1.environmentReferences.mongoReference;
}
exports.getMongo = getMongo;
//# sourceMappingURL=Config.js.map
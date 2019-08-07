const mongoose = require('mongoose');

const schema = new mongoose.Schema({
  id: String,
  hostname: String,
  "context": String,
  "shared": Boolean,
  "appConfigUrl": String,
  "apphubUrl": String,
  "applicationChrome": Boolean,
  "customHeader": {},
  "service_id": String,
  "plan_id": String,
  "org_id": String,
  space_id: String
});
module.exports = mongoose.model('Tenant', schema);

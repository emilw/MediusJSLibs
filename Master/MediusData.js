var MediusData = function()
{
  var self = this;
  
  self.getDataSynch = function(serviceName, functionName, params)
  {
		var ajax = require("medius/lib/ajax");
		var path = require("medius/lib/path");
		var serialization = require("medius/lib/serialization");
		var rpc = require("medius/core/rpc");
		//var params = {hqlQuery: query};
		
		var result;
  
	  rpc.ajax(rpc.createUrl(functionName, serviceName),
			{ data: serialization.toJSON(params), async: false}
			, { secure: true })
		.done(function(data) {
			result = data;
		})
		.fail(function(e) {
			alert("Failed to execute query: " + params.hqlQuery);
			});
			
	return result;
  };
  
  /**
    * Calls the configuration service to fetch the appropriate config record for a root object
    *
    * @params contextCompanyId the context company, for what company the config is active
    * @params entityTypeName the root element that the configuration is connected to, e.g. a supplier or company for instance
	* @params entityId the id of the root entity, e.g. a supplier.Id or company.Id
	* @params configurationObjectTypeName the configuration record type connected to the root type
    * @returns entity
	* 
	* @example
    * 
	* if(companyId != 0 && supplierId != 0) {
	*	var conf = proxyData.GetConfigurationObject(companyId, "Medius.Enterprise.Entities.Supplier", supplierId, "Medius.Enterprise.Entities.SupplierConfiguration");
	*	var responsibleUser = conf.Data.ResponsibleConfiguration.Responsible.User;
	*	userText = responsibleUser.FirstName + " " + responsibleUser.LastName;
	* }
    */
  self.GetConfigurationObject = function(contextCompanyId, entityTypeName, entityId, configurationObjectTypeName) {
	var params = {};
	params.contextCompanyId = contextCompanyId;
	params.entityTypeName = entityTypeName;
	params.entityId = entityId;
	params.configurationObjectTypeName = configurationObjectTypeName;
	
	return self.getDataSynch("ConfigurationService", "GetConfigurationEntity", params);
  };
  
  self.QueryDocumentAgregated = function(query)
  {
	var params = {hqlQuery: query};
	var result = self.getDataSynch("PurchaseToPayGadgetDataService", "GetAgregatedData", params);
			
	return result;
  };
  
  self.QueryDocument = function(tag, query, pageSize, pageNumber)
  {
		var params = {tag: tag, query: query, pageSize: pageSize, pageNumber: pageNumber};
		//var params = {tag: tag, contextCompanyId: null};
		
		
		var result = self.getDataSynch("DataDefinitionManager", "GetPageOfDataForTag", params);
		//var result = self.getDataSynch("DataDefinitionManager", "GetPageOfData", params);
			
	return result;
  };
  
  self.QueryDocumentFlat = function(query, columns)
  {
	var params = {hqlQuery: query, properties: columns};
	var result = self.getDataSynch("CoreGadgetService", "GetFlatData", params);
			
	return result;
  };
  
};
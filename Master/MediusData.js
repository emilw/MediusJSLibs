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
var MediusDataGrid = function(){

	var self = this;
	
	var Lib = require("medius/lib/path");
	
	/**
    * Create a manual grid - If custom data is needed to be inserted, this can be done through this Grid
    *
    * @params elementName the element to bind the grid to
    * @params data an array with data objects
	* @params columns a list of columns where each columns looks like this { ColumnName: record, ValueSource: record }
	* @params options the option parameter where things can be adjusted to get a specific behaviour
    * @returns void
	* 
	* @example
    * var grid = new MediusDataGrid();
	* var proxyData = new MediusData();
	* var data = proxyData.QueryDocument("Medius.Core.Entities.Help.HelpRequest", "", 10, 1);
	* var cols = "Id,Title".split(",");//self.gadget.Settings()[2].Value().split(",");
	* var columns = [];
	* _.each(cols, function (record) {
	*			columns.push({ ColumnName: record, ValueSource: record });
	*		});
	* var option = {};
	* grid.CreateManualGrid("#g-@Model.Id", data, columns, option);
    */
	self.CreateManualGrid = function(elementName, data, columns, option) {
		
		var DataGrid = require("medius/components/grid/dataGrid");
		var DataSource = require("medius/components/grid/dataSource/default");
		
		var gridHelpers = medius.Grid;
		var dataSource = new DataSource();
		
		if(!option) {
			option = {};
		};
		
		dataSource.Columns(columns);
		
		_.each(data, function (record) {
					//columns.push({ ColumnName: record.replace('.', '_'), ValueSource: record.replace('.', '_') });
					//record.Columns = ["Id", "Title"];
					record.isSelected = false;
					record.Columns = gridHelpers.resolveColumns(record, dataSource.Columns());
		});
		
		dataSource.Rows(data);
		
		
		dataSource.getTotalRows = function (dataQuery) {
			return this.Rows().length;
        };
		
		dataSource.load = function(dataQuery) {
			return this.Rows();
		};
		if(!option.gridOption) {
			option.gridOption = {};
			option.gridOption.search = false;
			option.gridOption.sort = false;
			option.gridOption.paging = false;
		};
		
		option.gridOption = self.setDataNavigationLink(option.gridOption, option.linkProperty, true);
		
		var dataGrid = new DataGrid(dataSource, option.gridOption);

		
		self.render(elementName, dataGrid);
		
	};
	/**
    * Create automatic grid - Handles the common scenario for a data type
	* The grid itself maintaince the data fetching, sorting, filtering etc.
    *
    * @params entityType a string representing the data object type
	* @params query the query that is applied on the entityType
	* @params columns a list of columns where each columns looks like this { ColumnName: record, ValueSource: record }
	* @params options the option parameter where things can be adjusted to get a specific behaviour
    * @returns void
	* 
	* @example
    * var grid = new MediusDataGrid();
	* Get the type
	* var tag = "Medius.Core.Entities.Help.HelpRequest";
	* //Get the where statement
	* var whereStatement = "RequestDate > '2011-12-01'";
	* var cols = ["Id", "Title"];
	* var pageSize = 10;
	* var columns = [];
	* _.each(cols, function (record) {
	*				columns.push({ ColumnName: record, ValueSource: record });
	*				});
	*			
	*			var option = {};
	*			option.documentLinkProperty = "Id";
	*			option.entityGridOption = {};
	*			option.entityGridOption.pageSize = pageSize;
	*							
	*			grid.CreateGrid("#g-@Model.Id", tag, whereStatement, columns, option);
    */	
	self.CreateGrid = function(entityType, query, columns, option){
	
		var EntityGrid = require("medius/components/grid/entity/grid");//"medius/components/grid/entityGrid");
		var SyncDataSource = require("medius/components/grid/dataSource/sync");
		var sync = require("medius/core/sync");
		
		if(!option){
			option = {};
		}
		
		var source = new SyncDataSource();
		
		source.loadColumns = function() {
			return $.Deferred().resolve(columns);
		};
		
		//Custom logic to provide Query with sorting and filtering support
		source.performAjaxLoad = function(entityDataQuery) {
			entityDataQuery.page = entityDataQuery.page || 1;
			entityDataQuery.pageSize = entityDataQuery.pageSize || 30;				
			
			var searchQueryBuilder = new HqlQueryBuilder(entityDataQuery);
			var sortQueryBuilder = new HqlQueryBuilder(entityDataQuery);
								
			var filterQuery = "";
			
			searchQueryBuilder.buildSearchQuery();
			
			if(searchQueryBuilder.getQuery()){
				filterQuery = searchQueryBuilder.getQuery();
				
				if(query){
					filterQuery = filterQuery + " AND ";
				}
			}
			else if(query){
					filterQuery = "where ";
			}
			
			if(query){
				filterQuery = filterQuery + query;
			}
			
			sortQueryBuilder.buildSortQuery();
			
			if(sortQueryBuilder.getQuery()){
				filterQuery = filterQuery + sortQueryBuilder.getQuery();
			}
						
			return sync.load(entityDataQuery.entityType, filterQuery,
					entityDataQuery.pageSize, entityDataQuery.page);
		};
		
		if(!option.entityGridOption){
			option.entityGridOption = {};
		}
		
		option.entityGridOption.dataSource = source;
		
		option.entityGridOption = self.setDataNavigationLink(option.entityGridOption, option.documentLinkProperty, true);	
		
		var entityGrid = EntityGrid.create(entityType, option.entityGridOption);
		
		return entityGrid;
	};
	
	self.setDataNavigationLink = function(gridOption, linkProperty, isDocument) {
		
		if(linkProperty){
				gridOption.onClickRow = function(e, y){
					window.location = Lib.getBasePath() + "#Tasks/ShowDocument/" + e[linkProperty];
				};
		};
		
		return gridOption;
	};
};
/**
    * Create automatic grid - Handles the common scenario for a data type
	* Shold be deleted from this file when the platform have been updated, require(HQLBuilder...) should be used instead.
    */	
var HqlQueryBuilder = function (entityDataQuery) {
			var self = this,
				query = "";

			self.buildSortQuery = function () {
				var sortKeys = _.keys(entityDataQuery.sorting);

				if (!_.isEmpty(sortKeys)) {
					query += " order by ";

					_.each(sortKeys, function (k) {
						var v = entityDataQuery.sorting[k];

						if (!_.isEmpty(v)) {
							query += "{0} {1}, ".format(k, v);
						}
					});

					query = query.substring(0, query.length - 2);
				}
			};

			self.buildSearchQuery = function () {
				var searchKeys = _.keys(entityDataQuery.keywords);

				// search
				if (!_.isEmpty(searchKeys)) {
					query += " where ";

					_.each(searchKeys, function (k) {
						var v = entityDataQuery.keywords[k];

						if (!_.isEmpty(v)) {
							query += "lower({0}) like '%{1}%' and ".format(k, v.toLowerCase());
						}
					});

					query = query.substring(0, query.length - 4);
				}
			};

			self.buildCount = function () {
				query += "select count(*) from {0} ".format(entityDataQuery.entityType);
			};

			self.getQuery = function () {
				return (_.isEmpty(query)) ? null : $.trim(query);
			};
		};

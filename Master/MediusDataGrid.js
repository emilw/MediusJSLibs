var MediusDataGrid = function(){
		
	var self = this;
		
	self.CreateGrid = function(elementName, entityType, query, columns, option){
	
		var EntityGrid = require("medius/components/grid/entityGrid");
		var SyncDataSource = require("medius/components/grid/dataSource/sync");
		var sync = require("medius/core/sync");
		var Lib = require("medius/lib/path");
		
		if(!option){
			option = {};
		}
		var source = new SyncDataSource();
		source.Columns(columns);
		
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
					filterQuery = " Where ";
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
		
		option.entityGridOption.onClickRow = function(e, y){
			if(option.documentLinkProperty){
				window.location = Lib.getBasePath() + "#Tasks/ShowDocument/" + e[option.documentLinkProperty];
			}
		};
		

		var entityGrid = new EntityGrid(entityType, option.entityGridOption);
		
		entityGrid.setTargetElement(elementName);
		entityGrid.render();
	};
};

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

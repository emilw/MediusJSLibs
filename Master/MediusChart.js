var MediusChart = function(){
var self = this;
self.previousPoint = null;

 self.showTooltip = function(x, y, contents) {
		$('<div id="tooltip">' + contents + '</div>').css( {
			position: 'absolute',
			display: 'none',
			top: y + 5,
			left: x + 5,
			border: '1px solid #fdd',
			padding: '2px',
			'background-color': '#fee',
			opacity: 0.80
		}).appendTo("body").fadeIn(200);
	};
  
  self.registerHooverBehaviour = function(placeholder){
	  $("#"+placeholder).bind("plothover", function(event, pos, item){
		  if (item) {
				if (self.previousPoint != item.dataIndex) {
					self.previousPoint = item.dataIndex;
					
					$("#tooltip").remove();
					var x = item.datapoint[0].toFixed(2),
						y = item.datapoint[1].toFixed(2);
												
					self.showTooltip(item.pageX, item.pageY,
									 item.series.label + ": " + y);
				}
			}
		  else {
				$("#tooltip").remove();
				previousPoint = null;
		  }
	  });
  };
 
 
  self.getDefaultOption = function(type)
  {
	  var option = {};
	  
	  if(type == "pie") {
		  option.series = { pie:{ show: true, radius: 1} };
		  option.series.pie.label = {
									  show: true,
									  radius: 3/4,
									  formatter: function(label, series){
										return '<div style="font-size:8pt;text-align:center;padding:2px;color:white;">'+label+'<br/>'+Math.round(series.percent)+'%</div>';
			},
			background: { opacity: 0.5 }};
		  
		  option.legend = { show: false };
	  }
	  
	  return option;
  };
  
  self.getDefaultDataSerie = function(data, type, serieName)
  {
	  var dataSerie = {};
	  dataSerie.data = data;
	  dataSerie.label = serieName;
	  
	  if(type == "bars"){
		   dataSerie.bars = {show: true, fill:true};
	   }
	  else{
		  dataSerie.lines = { show: true, fill: true };
	  }
	  return dataSerie;
  };
  
  self.init = function(placeholder, dataSerie, option)
  {
	  if(option.series){
		  var data = [];
		  for(var i = 0; i < dataSerie.data.length; i++){
			  data.push({label: dataSerie.data[i][0], data: dataSerie.data[i][1]});
		  }
		  dataSerie = data;
	  }
	  else{
		  dataSerie = [dataSerie];
	  }
	  
	  self.registerHooverBehaviour(placeholder);
	  
	  option.grid = { hoverable: true, clickable: true };
	  $.plot($("#"+placeholder), dataSerie, option);
  };
  
  self.initGraph = function(placeholder, data, type, serieName, isDate)
  {
	  if(isDate){
		  self.initDateGraph(placeholder, data, type, serieName);
	  }
	  else if(isNaN(data[0][0])){
		  self.initStringGraph(placeholder, data, type, serieName);
	  }
	  else {
		self.initNumberGraph(placeholder, data, type, serieName);
	  }
  };
  
  self.initStringGraph = function(placeholder, data, type, serieName){
		var option = self.getDefaultOption(type);
		option.xaxis = {};
		option.xaxis.ticks = [];
		
		if(type != "pie") {
			for(var i = 0; i < data.length; i++) {
					option.xaxis.ticks.push([i, data[i][0]]);
					data[i][0] = i;
			}
		};

		var dataSerie = self.getDefaultDataSerie(data, type, serieName);
		self.init(placeholder, dataSerie, option);
  }
  
  self.initNumberGraph = function(placeholder, data, type, serieName)
  {
	  
	  var option = self.getDefaultOption(type);
	  var dataSerie = self.getDefaultDataSerie(data, type, serieName);              
	  self.init(placeholder, dataSerie, option);
  };          
  
  self.initDateGraph = function(placeholder, data, type, serieName)
  {
	  var option = self.getDefaultOption(type);
	  
	  for(var i = 0; i < data.length; i++)
	   {
		   data[i][0] = new Date(data[i][0]);
	   }
	   option.xaxis = {mode: "time", timeformat: "%y-%0m-%0d"};
	  
	 
	  var dataSerie = self.getDefaultDataSerie(data, type, serieName);
	  
	  self.init(placeholder, dataSerie, option);
  };
};
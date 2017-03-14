// Make sure to encapsulate your code inside an IIFE to protect against leaking globals
// lodash '_', jQuery '$', kendo 'kendo' and corascloud 'cc' are globally available.


(function() {

    // The IIFE should return a Knockout ViewModel, which will be used in combination with the HTML fragment to create a
    // custom component. This will be dynamically inserted into the DOM at runtime (after all dependencies like ext. JavaScript
    // and ext. CSS have been resolved.

    // See http://knockoutjs.com/documentation/component-registration.html#a-constructor-function


    function ViewModel ( params ) {

        // Provides access to data sources, which have been chosen in the Designer
        this.listsInfo = params.listsInfo;
        var self = this;
        self.selectedProject = cmApp.selectedProject;
        self.datasources = ko.observableArray();

        self.projectFilter = null;
        self.projectFilterArray = [];

        self.chartConfig = function(chartData){

            // create data set on our data
            self.dataSet = anychart.data.set();
            self.dataSet.data(chartData);

            // map data for the first series, take x from the zero column and value from the first column of data set
            self.seriesData_1 = self.dataSet.mapAs({x: [0], value: [1]});

            // map data for the second series, take x from the zero column and value from the second column of data set
            self.seriesData_2 = self.dataSet.mapAs({x: [0], value: [2]});

            // map data for the third series, take x from the zero column and value from the third column of data set
            // self.seriesData_3 = self.dataSet.mapAs({x: [0], value: [3]});

            // create line chart
            self.chart = anychart.line();
            //define palette
            self.chart.palette(["#0000FF","#FF0000","#00FF00"]);// blue, red, green

            // turn on chart animation
            self.chart.animation(true);

            // turn on the crosshair
            self.chart.crosshair().enabled(true).yLabel().enabled(false);
            self.chart.crosshair().yStroke(null);

            // set tooltip mode to point
            self.chart.tooltip().positionMode('point');

            // set chart title text settings
            self.chart.title('Vendor Burndown');
            self.chart.title().padding([0, 0, 5, 0]);

            // set yAxis title
            self.chart.yAxis().title('Budget & Expenses');

            // create first series with mapped data
            self.series_1 = self.chart.line(self.seriesData_1);
            self.series_1.name('Planned Burn');
            self.series_1.hoverMarkers().enabled(true).type('circle').size(4);
            self.series_1.tooltip().position('right').anchor('left').offsetX(5).offsetY(5);

            // create second series with mapped data
            self.series_2 = self.chart.line(self.seriesData_2);
            self.series_2.name('Actual Burn');
            self.series_2.hoverMarkers().enabled(true).type('circle').size(4);
            self.series_2.tooltip().position('right').anchor('left').offsetX(5).offsetY(5);

            // create third series with mapped data
            /* self.series_3 = self.chart.line(self.seriesData_3);
             self.series_3.name('Tequila');
             self.series_3.hoverMarkers().enabled(true).type('circle').size(4);
             self.series_3.tooltip().position('right').anchor('left').offsetX(5).offsetY(5);   */

            // turn the legend on
            self.chart.legend().enabled(true).fontSize(13).padding([0, 0, 10, 0]);

            // set container id for the chart and set up paddings
            self.chart.container('vendorchart');
            self.chart.padding([10, 20, 5, 20]);

            //draw the chart
            self.chart.draw();
        };



        self.burndownData = function(data){
            var totalBudget = 0;
            var monthPlannedBurndown;
            var monthActualBurndown;
            var chartData = [];
            var filteredItems = ko.utils.arrayFilter(data, function(item) {
                if (item.vendor() === true){
                    totalBudget += item.plannedamount();
                    return item;
                }
            });

            monthPlannedBurndown = totalBudget;
            monthActualBurndown = totalBudget;

            var allChartMonths = ko.utils.arrayMap(filteredItems, function(item) {
                return item.planneddate();
            });
            var chartMonths = ko.utils.arrayGetDistinctValues(allChartMonths).sort();

            //set starting point for burndown (total budget)
            chartData.push([moment(chartMonths[0]).subtract(1,'M').format('MMM'),totalBudget,totalBudget]);

            //loop through unique months
            ko.utils.arrayForEach(chartMonths, function(item) {
                var date = item;

                //loop through the filtered items to find matching month financials.
                ko.utils.arrayForEach(filteredItems, function(item){
                    if ((item.planneddate() == date))
                    {
                        console.log('test: '+(item.planneddate() == date));
                        monthPlannedBurndown = monthPlannedBurndown - item.plannedamount();
                        monthActualBurndown = item.actualamount() > 0 ? monthActualBurndown - item.actualamount() : null;
                    }
                });
                chartData.push([moment(date).format('MMM'),monthPlannedBurndown,monthActualBurndown]);
                console.log('Month: '+moment(date).format('MMM')+' | '+monthPlannedBurndown+' | '+monthActualBurndown);
            });
            console.log(chartData);
            return chartData;
        };




        self.ListDataType =
            function( item ) {

                var data =
                    {
                        id: ko.observable( item.Id ? item.Id : '' ),
                        title: ko.observable( item.Title ? item.Title : '' ),
                        expensetype: ko.observable( item.ExpenseType ? item.ExpenseType : '' ),
                        vendor: ko.observable( item.Vendor ? item.Vendor : '' ),
                        plannedamount: ko.observable( item.PlannedAmount ? item.PlannedAmount : '' ),
                        planneddate: ko.observable( item.PlannedDate ? item.PlannedDate.setDate(1) : '' ),
                        actualamount: ko.observable( item.ActualAmount ? item.ActualAmount : '' ),
                        actualdate: ko.observable( item.ActualDate ? item.ActualDate.setMonth(1) : '' )
                    };
                return data;
            };

        self.loadData = function(projectId){
            if (cmApp.projectsInPortfolio.length > 0 && cmApp.thisApp == 'Portfolios' || cmApp.thisApp == 'Executive Dashboard') {
                self.projectFilterArray = [];
                self.projectFilterArray.push({"field":"Project/ItemId","operator":"eq","value": projectId});

                self.projectFilter = self.projectFilterArray;
                cmApp.datasource('Expenses', false).done(function (ds) {
                    self.datasources.removeAll();
                    var filter = '{"logic":"and","filters": ' + JSON.stringify(self.projectFilter) + '}';
                    ds.query({
                        // sort: { field: "ganttId", dir: "asc" },
                        pageSize: 25000,
                        filter: JSON.parse(filter)
                    }).then(function () {
                        _.each(ds.data(), function (datasource, index) {
                            self.datasources.push(new self.ListDataType(datasource));
                        });


                        self.dataSet.data(self.burndownData(self.datasources()));
                    });
                });
            }
        };
        $.when(cmApp.ready).done(function () {
            self.chartConfig([]);
            self.loadData(cmApp.selectedProject);
        });
        cc.events.on('cmAppNewProjectSelected', function (evt) {
            self.loadData(evt.projectId);
        });

    }


    // add your prototype methods
    $.extend(true, ViewModel.prototype, {

        // dispose gets called when the custom component is destroyed
        // see http://knockoutjs.com/documentation/component-binding.html#disposal-and-memory-management

        dispose: function(){

            // tear down/cleanup
            //console.log('dispose', this);

        },

        // initComponent handler to provide early access to the HTML fragment after it has been attached to the DOM.
        // At that time elements inside the HTML fragment can be accessed via jQuery.
        // In order to support multiple instances of the component jQuery selectors should be scoped to the current view.

        initComponent : function( view ) {

            // $('.mySelector', view).doSomething();

        }


    });

    return ViewModel;

})();


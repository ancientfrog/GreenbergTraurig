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
        self.rollingvariancekeeper = ko.observable(0);
        self.ListDataType =
            function( item ) {
                var data =
                    {
                        id: ko.observable( item.Id ? item.Id : '' ),
                        phase: ko.observable( item.Title ? item.Title : '' ),
                        plannedstart: ko.observable( item.StartDate ? moment(item.StartDate).format('MM/DD/YYYY') : '' ),
                        plannedend: ko.observable( item.EndDate ? moment(item.EndDate).format('MM/DD/YYYY') : '' ),
                        actualstart: ko.observable( item.ActualStart ? moment(item.ActualStart).format('MM/DD/YYYY') : '' ),
                        estend: ko.observable( item.ActualFinish ? moment(item.ActualFinish).format('MM/DD/YYYY') : '' )
                    };
                data.variance =
                    ko.computed(function() {

                        if (item.EndDate && item.ActualFinish){
                            self.weeks = moment(item.EndDate).diff(moment(item.ActualFinish), 'days') / 7;
                            return Math.round(self.weeks);
                        }else{
                            return 0;
                        }
                    });


                self.rollingvariancekeeper(self.rollingvariancekeeper() + data.variance());
                data.rollingaggregate = self.rollingvariancekeeper();
                return data;
            };
        self.loadData = function(projectId){
            if (cmApp.projectsInPortfolio.length > 0 && cmApp.thisApp == 'Portfolios' || cmApp.thisApp == 'Executive Dashboard') {
                self.projectFilterArray = [];
                self.projectFilterArray.push({"field":"Project/ItemId","operator":"eq","value": projectId});

                self.projectFilter = self.projectFilterArray;
                cmApp.datasource('Tasks', false).done(function (ds) {
                    self.datasources.removeAll();
                    var filter = '{"logic":"and","filters": ' + JSON.stringify(self.projectFilter) + '}';
                    ds.query({
                        // sort: { field: "ganttId", dir: "asc" },
                        pageSize: 25000,
                        filter: JSON.parse(filter)
                    }).then(function () {


                        var ProjectLevelTask =  ko.utils.arrayFilter(ds.data(), function(task) {
                            return task.TopLevel == true ;
                        });
                        ko.utils.arrayForEach(ProjectLevelTask, function(item ) {
                            var Level2Task =  ko.utils.arrayFilter(ds.data(), function(task) {
                                return task.Parent == item.Id ;
                            });
                            ko.utils.arrayForEach(Level2Task, function(item ) {
                                self.datasources.push(new self.ListDataType(item));
                            });
                        });
                    });
                });
            }

        };
        $.when(cmApp.ready).done(function () {
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


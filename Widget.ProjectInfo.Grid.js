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
        self.TaskDS = [];
        self.ListDataType =
            function( item ) {
                console.log(item);
                var data =
                    {
                        id: ko.observable( item.Id ? item.Id : '' ),
                        title: ko.observable( item.Title ? item.Title : '' ),
                        description: ko.observable( item.Description_cc_ ? item.Description_cc_.replace(/(<([^>]+)>)/ig, "") : '' ),
                        targetstart: ko.observable( item.ProposedStartDate ? moment(item.ProposedStartDate).format('MM/DD/YYYY') : '' ),
                        targetend: ko.observable( item.ProposedEndDate ? moment(item.ProposedEndDate).format('MM/DD/YYYY') : '' ),
                        // Pcomplete: ko.observable( item.Id ? item.Id : '' ),
                        // phase: ko.observable( item.Id ? item.Id : '' ),
                        health: ko.observable( item.Id ? item.Id : '' ),
                        cost: ko.observable( item.ProposedBudget ? item.ProposedBudget.toLocaleString('en-US',{ style: 'currency', currency: 'USD', maximumFractionDigits : 0 }) : '' ),
                        status: ko.observable( item.BLUF ? item.BLUF.replace(/(<([^>]+)>)/ig, "") : '' ),
                        scheduleKPI: ko.observable( item.ScheduleKPI ? item.ScheduleKPI.Title : null ),
                        performanceKPI: ko.observable( item.PerformanceKPI ? item.PerformanceKPI.Title : null ),
                        costKPI: ko.observable( item.CostKPI ? item.CostKPI.Title : null )
                    };



                data.overAllHealth =
                    ko.computed(function() {
                        SKPI = data.scheduleKPI() ? data.scheduleKPI().charAt(0) : '';
                        PKPI = data.performanceKPI() ? data.performanceKPI().charAt(0) : '';
                        CKPIO = data.costKPI() ? data.costKPI().charAt(0) : '';

                        return '<div>C - ' + CKPIO +'</div><div>S - ' + SKPI + '</div><div>P - ' + PKPI;
                    });

                data.Pcomplete =
                    ko.computed(function() {
                        var ProjectLevelTask =  ko.utils.arrayFilter(self.TaskDS, function(task) {
                            return task.TopLevel == true ;
                        });
                        return ProjectLevelTask[0].Complete;
                    });
                data.phase =
                    ko.computed(function() {
                        var ProjectLevelTask =  ko.utils.arrayFilter(self.TaskDS, function(task) {
                            return task.TopLevel == true ;
                        });
                        var CurrentPhase =  ko.utils.arrayFilter(self.TaskDS, function(task) {
                            return task.Parent == ProjectLevelTask[0].Id && task.Complete != 100 && task.Complete > 0;
                        });
                        return CurrentPhase.length != 0 ? CurrentPhase[0].Title : 'No Phases';
                    });

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
                        sort: { field: "ganttId", dir: "asc" },
                        pageSize: 25000,
                        filter: JSON.parse(filter)
                    }).then(function () {
                        self.TaskDS = ds.data();
                        self.projectFilterArray = [];
                        self.projectFilterArray.push({"field":"Id","operator":"eq","value": projectId});
                        self.projectFilter = self.projectFilterArray;
                        cmApp.datasource('Projects', false).done(function (ds) {
                            self.datasources.removeAll();
                            var filter = '{"logic":"or","filters": ' + JSON.stringify(self.projectFilter) + '}';
                            ds.query({
                                // sort: { field: "ganttId", dir: "asc" },
                                pageSize: 25000,
                                filter: JSON.parse(filter)
                            }).then(function () {
                                _.each(ds.data(), function (datasource, index) {
                                    self.datasources.push(new self.ListDataType(datasource));
                                });
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


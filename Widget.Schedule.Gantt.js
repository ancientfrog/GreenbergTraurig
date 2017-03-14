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
        self.projectTasks = [];
        self.collapsedTasks = [];
        self.filterCriteria = '';
        self.selectedItem = '';
        self.treeData = '';
        self.topLevelUpdate = false;
        self.startDate = '';
        self.endDate = '';
        self.originalStartDate = '';
        self.startDateChange = false;
        self.endDateChange = false;
        self.hourDiff = '';
        self.ds = '';

        // create project gantt chart
        self.chart = anychart.ganttProject();
        // set container id for the chart
        self.chart.container('container');

        // set general splitter pixel position
        self.chart.splitterPosition(200);
        self.dataGrid = self.chart.dataGrid();
        /*        var actualStart = self.dataGrid.column(2);
         actualStart.title('Start Date');
         actualStart.setColumnFormat('actualStart', anychart.enums.ColumnFormats.DATE_US_SHORT);
         var actualEnd = self.dataGrid.column(3);
         actualEnd.title('End Date');
         actualEnd.setColumnFormat('actualEnd', anychart.enums.ColumnFormats.DATE_US_SHORT);*/
        self.dataGrid.column(1).width(175);
        self.dataGrid.column(0).width(0);
        // styling the data grid
        self.dataGrid.rowEvenFill('#e3f2fd');
        self.dataGrid.rowOddFill('#f6fbfe');
        self.dataGrid.rowHoverFill('#fff8e1');
        self.dataGrid.rowSelectedFill('#ffecb3');
        self.dataGrid.columnStroke('2 #90caf9');
        // coloring the data grid's edit controls
        self.dataGrid.editStructurePreviewFill('red 0.3');
        self.dataGrid.editStructurePreviewStroke('red');
        self.dataGrid.editStructurePreviewDashStroke({
            color: 'red',
            dash: '5 2',
            thickness: 2
        });
        //disable data grid
        // chart.dataGrid(false);

        // getting chart's timeline
        self.timeline = self.chart.getTimeline();
        // styling the timeline
        self.timeline.rowEvenFill('#e3f2fd');
        self.timeline.rowOddFill('#f6fbfe');
        self.timeline.rowHoverFill('#fff8e1');
        self.timeline.rowSelectedFill('#ffecb3');
        self.timeline.columnStroke('2 #90caf9');
        // coloring the timeline's edit controls
        self.timeline.connectorPreviewStroke('3 green 0.3');
        self.timeline.editPreviewFill('black 0.2');
        self.timeline.editPreviewStroke('3 blue 0.8');
        self.timeline.editProgressFill('yellow');
        self.timeline.editProgressStroke('2 black');
        self.timeline.editIntervalThumbFill('red');
        self.timeline.editIntervalThumbStroke('black');
        self.timeline.editConnectorThumbFill('#9f9');
        self.timeline.editConnectorThumbStroke('#090');
        // make chart editable
        self.chart.editing(false);
        self.chart.credits().enabled(false);

        self.drawGantt = function () {
            // cmApp.blockUI();
            self.dataGrid = self.chart.dataGrid();
            // var dgTooltip = self.dataGrid.tooltip();
            /*
             dgTooltip.textFormatter(function(event) {
             var actualStart = '';
             var actualEnd = '';
             var progressValue = '';
             var keyActivity = '';
             var assignedTo = '';
             if (event.actualStart !== undefined) {
             actualStart = moment(event.actualStart).format('MM/DD/YYYY');
             } else {
             actualStart = moment(event.autoStart).format('MM/DD/YYYY');
             }
             if (event.actualEnd !== undefined) {
             actualEnd = moment(event.actualEnd).format('MM/DD/YYYY');
             } else {
             actualEnd = moment(event.autoEnd).format('MM/DD/YYYY');
             }
             if (event.progressValue !== undefined) {
             progressValue = event.progressValue;
             } else {
             progressValue = (event.item.B.autoProgress * 100).toFixed(2) === '0.00' ? '0%' : Number(event.item.B.autoProgress * 100).toFixed(2) + '%';
             }
             if (event.a.b.keyActivity !== undefined) {
             keyActivity = event.a.b.keyActivity;
             } else {
             keyActivity = false;
             }
             if (event.a.b.assignedTo !== undefined) {
             assignedTo = event.a.b.assignedTo;
             } else {
             assignedTo = '';
             }
             return 'Start Date: ' + actualStart + '\nEnd Date: ' + actualEnd + '\nComplete: ' + progressValue + '\nAssigned To: ' + assignedTo + '\nKey Activity: ' + keyActivity;
             });
             */

            /*            var tlTooltip = self.timeline.tooltip();
             tlTooltip.textFormatter(function(event) {
             var actualStart = '';
             var actualEnd = '';
             var progressValue = '';
             var keyActivity = '';
             var assignedTo = '';
             if (event.actualStart !== undefined) {
             actualStart = moment(event.actualStart).format('MM/DD/YYYY');
             } else {
             actualStart = moment(event.autoStart).format('MM/DD/YYYY');
             }
             if (event.actualEnd !== undefined) {
             actualEnd = moment(event.actualEnd).format('MM/DD/YYYY');
             } else {
             actualEnd = moment(event.autoEnd).format('MM/DD/YYYY');
             }
             if (event.progressValue !== undefined) {
             progressValue = event.progressValue;
             } else {
             progressValue = (event.item.B.autoProgress * 100).toFixed(2) === '0.00' ? '0%' : Number(event.item.B.autoProgress * 100).toFixed(2) + '%';
             }
             if (event.a.b.keyActivity !== undefined) {
             keyActivity = event.a.b.keyActivity;
             } else {
             keyActivity = false;
             }
             if (event.a.b.assignedTo !== undefined) {
             assignedTo = event.a.b.assignedTo;
             } else {
             assignedTo = '';
             }
             return 'Start Date: ' + actualStart + '\nEnd Date: ' + actualEnd + '\nComplete: ' + progressValue + '\nAssigned To: ' + assignedTo + '\nKey Activity: ' + keyActivity;
             });*/

            var allEvents = null;
            // create data tree on raw data
            self.treeData = anychart.data.tree(self.projectTasks, anychart.enums.TreeFillingMethod.AS_TABLE);

            // set data for the chart
            self.chart.data(self.treeData);

            // initiate chart drawing
            self.chart.draw();

            // zoom chart all dates range
            self.chart.fitAll();

            cmApp.unblockUI();
        };

        self.loadTasks = function () {
            cmApp.blockUI();
            self.projectTasks = [];
            var parentItem = '';
            var parent = '';
            var sortedTasks = [];
            sortedTasks = self.ds.data().sort(function(a, b){
                return a.ganttId-b.ganttId;
            });
            _.each(sortedTasks, function(data, i){
                if (data.Parent !== undefined) {
                    parentItem = _.findIndex(sortedTasks, {Id: data.Parent});
                    parent = parentItem + 1;
                } else {
                    parent = '';
                }
                var actualStyling = '';
                if (data.KeyActivity === true) {
                    actualStyling = '3 green';
                }
                if (data.SummaryTask === true) {
                    if (data.TopLevel === true) {
                        if (sortedTasks.length > 1) {
                            self.projectTasks.push({
                                id: data.ganttId,
                                taskId: data.Id,
                                name: data.Title,
                                parent: '',
                                autoProgress: '',
                                autoStart: '',
                                autoEnd: '',
                                assignedTo: '',
                                topLevel: true,
                                summaryTask: true,
                                actual: {
                                    label: {
                                        position: 'Center',
                                        anchor: 'Center',
                                        padding: 0,
                                        fontColor: 'white'
                                    },
                                    stroke: actualStyling
                                }
                            });
                        } else {
                            self.projectTasks.push({
                                id: data.ganttId,
                                taskId: data.Id,
                                name: data.Title,
                                parent: '',
                                actualStart: moment(data.StartDate).valueOf(),
                                actualEnd: moment(data.EndDate).valueOf(),
                                assignedTo: '',
                                topLevel: true,
                                summaryTask: true,
                                actual: {
                                    label: {
                                        position: 'Center',
                                        anchor: 'Center',
                                        padding: 0,
                                        fontColor: 'white'
                                    },
                                    stroke: actualStyling
                                }
                            });
                        }
                    } else {
                        self.projectTasks.push({
                            id: data.ganttId,
                            taskId: data.Id,
                            name: data.Title,
                            parent: parent,
                            summaryTask: true,
                            autoProgress: '',
                            autoStart: '',
                            autoEnd: '',
                            assignedTo: '',
                            actual: {
                                label: {
                                    position: 'Center',
                                    anchor: 'Center',
                                    padding: 0,
                                    fontColor: 'white'
                                },
                                stroke: actualStyling
                            }
                        });
                    }
                } else {
                    var assignedTo = '';
                    if (data.AssignedTo !== undefined && data.AssignedTo.length === 1) {
                        assignedTo = data.AssignedTo[0].DisplayName;
                    }
                    var connectedItem = _.find(sortedTasks, {Id: data.connectTo});
                    var connectTo = '';
                    if (connectedItem !== undefined) {
                        connectTo = connectedItem.ganttId;
                    }
                    var startDate = '';
                    var endDate = '';
                    if (data.StartDate === null) {
                        startDate = moment().startOf('day').add(8, 'hours').valueOf();
                    } else {
                        startDate = moment(data.StartDate).valueOf();
                    }
                    if (data.EndDate === null) {
                        endDate = moment().startOf('day').add(41, 'hours').valueOf();
                    } else {
                        endDate = moment(data.EndDate).valueOf();
                    }
                    self.projectTasks.push({
                        id: data.ganttId,
                        taskId: data.Id,
                        name: data.Title,
                        parent: parent,
                        actualStart: startDate,
                        actualEnd: endDate,
                        progressValue: data.Complete + '%',
                        connectTo: connectTo,
                        connectorType: data.connectorType,
                        assignedTo: assignedTo,
                        summaryTask: false,
                        keyActivity: data.KeyActivity,
                        actual: {
                            label: {
                                position: 'Center',
                                anchor: 'Center',
                                padding: 0,
                                fontColor: 'white'
                            },
                            stroke: actualStyling
                        }
                    });
                }
            });
            self.drawGantt();
            _.each(self.collapsedTasks, function(data, i){
                if (data.collapsed === true) {
                    var taskItem  = _.find(self.projectTasks, {taskId:data.taskId});
                    self.chart.collapseTask(taskItem.id);
                }
            });

            cmApp.unblockUI();
        };

        $.when(cmApp.ready).done(function () {

            cmApp.datasource('Tasks', true).done(function (ds) {
                self.collapsedTasks = [];
                self.ds = ds;
                var filter = '{"logic":"and","filters":[{"field":"Project/ItemId","operator":"eq","value":"' + cmApp.selectedProject + '"}]}';
                self.ds.query({
                    filter: JSON.parse(filter)
                }).then(function () {
                    if (self.ds.data().length >= 1) {
                        self.loadTasks();
                    } else {
                        cmApp.datasource('Projects', true).done(function (ds) {
                            if (ds === null) {
                                console.log('Projects datasource connection not found');
                            } else {
                                var filter = '{"logic":"and","filters":[{"field":"Id","operator":"eq","value":"' + cmApp.selectedProject + '"}]}';
                                ds.query({
                                    filter: JSON.parse(filter)
                                }).then(function () {
                                    if (ds.data().length >= 1) {
                                        var startDate = moment(ds.data()[0].ProposedStartDate).format('YYYY-MM-DDT08:00:00Z');
                                        var endDate = moment(ds.data()[0].ProposedEndDate).format('YYYY-MM-DDT17:00:00Z');
                                        self.ds.add({dirty: true, ganttId: 1, Title: ds.data()[0].Title, Parent: null, Project: null, StartDate: startDate, EndDate: endDate, SummaryTask: true, TopLevel: true, KeyActivity: false, Work: 0, Complete: 0});
                                        self.ds.sync().then(function (){
                                            self.loadTasks();
                                        });
                                    } else {
                                        console.log('No data is returned');
                                    }
                                });
                            }
                        });
                    }
                });
            });

            cc.events.on('cmAppNewProjectSelected', function (evt) {
                self.collapsedTasks = [];
                var filter = '{"logic":"and","filters":[{"field":"Project/ItemId","operator":"eq","value":"' + evt.projectId + '"}]}';
                self.ds.query({
                    filter: JSON.parse(filter)
                }).then(function () {
                    if (self.ds.data().length >= 1) {
                        self.loadTasks();
                    } else {
                        cmApp.datasource('Projects', true).done(function (ds) {
                            if (ds === null) {
                                console.log('Projects datasource connection not found');
                            } else {
                                var filter = '{"logic":"and","filters":[{"field":"Id","operator":"eq","value":"' + evt.projectId + '"}]}';
                                ds.query({
                                    filter: JSON.parse(filter)
                                }).then(function () {
                                    if (ds.data().length >= 1) {
                                        var startDate = moment(ds.data()[0].ProposedStartDate).format('YYYY-MM-DDT08:00:00Z');
                                        var endDate = moment(ds.data()[0].ProposedEndDate).format('YYYY-MM-DDT17:00:00Z');
                                        self.ds.add({dirty: true, ganttId: 1, Title: ds.data()[0].Title, Parent: null, Project: null, StartDate: startDate, EndDate: endDate, SummaryTask: true, TopLevel: true, KeyActivity: false, Work: 0, Complete: 0});
                                        self.ds.sync().then(function (){
                                            self.loadTasks();
                                        });
                                    } else {
                                        console.log('No data is returned');
                                    }
                                });
                            }
                        });
                    }
                });
            }, self);


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


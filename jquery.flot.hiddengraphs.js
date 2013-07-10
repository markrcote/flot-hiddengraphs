/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/. */

/*
 * Plugin to hide series in flot graphs.
 *
 * To activate, set legend.hideable to true in the flot options object.
 * To hide one or more series by default, set legend.hidden to an array of label strings.
 *
 * At the moment, this only works with line and point graphs
 *
 * Example:
 *
 *     var plotdata = [{data: [[1, 1], [2, 1], [3, 3], [4, 2], [5, 5]], label: "graph 1"},
 *                     {data: [[1, 0], [2, 1], [3, 0], [4, 4], [5, 3]], label: "graph 2"}];
 *
 *     plot = $.plot($("#placeholder"), plotdata, {
 *        series: {
 *             points: { show: true },
 *             lines: { show: true }
 *         },
 *         legend: {
 *             hideable: true,
 *             hidden: ["graph 1", "graph 2"]
 *         }
 *     });
 *
 */
(function ($) {
    var options = { };
    var drawnOnce = false;

    function init(plot) {
        function findPlotSeries(label) {
            var plotdata = plot.getData();
            for (var i = 0; i < plotdata.length; i++) {
                if (plotdata[i].label == label) {
                    return plotdata[i];
                }
            }
            return null;
        }

        function plotLabelClicked(label, mouseOut) {
            var series = findPlotSeries(label);
            if (!series) {
                return;
            }

            var switched_off = false;
            if (typeof series.points.oldshow === "undefined") {
                series.points.oldshow = false;
            }
            if (typeof series.lines.oldshow === "undefined") {
                series.lines.oldshow = false;
            }
            if (series.points.show && !series.points.oldshow) {
                series.points.show = false;
                series.points.oldshow = true;
                switched_off = true;
            }
            if (series.lines.show && !series.lines.oldshow) {
                series.lines.show = false;
                series.lines.oldshow = true;
                switched_off = true;
            }
            if (switched_off) {
                series.oldColor = series.color;
                series.color = "#ddd";//grey
            } else {
                var switched_on = false;
                if (!series.points.show && series.points.oldshow) {
                    series.points.show = true;
                    series.points.oldshow = false;
                    switched_on = true;
                }
                if (!series.lines.show && series.lines.oldshow) {
            	    series.lines.show = true;
                    series.lines.oldshow = false;
                    switched_on = true;
                }
                if (switched_on) {
            	    series.color = series.oldColor;
            	}
            }

            plot.setupGrid();
            plot.draw();
        }

        function plotLabelHandlers(plot, options) {
            $(".graphlabel").mouseenter(function() { $(this).css("cursor", "pointer"); })
                            .mouseleave(function() { $(this).css("cursor", "default"); })
                            .unbind("click").click(function() { plotLabelClicked($(this).parent().text()); });
            if (!drawnOnce) {
                drawnOnce = true;
                if (options.legend.hidden) {
                    for (var i = 0; i < options.legend.hidden.length; i++) {
                        plotLabelClicked(options.legend.hidden[i], true);
                    }
                }
            }
        }

        function checkOptions(plot, options) {
            if (!options.legend.hideable) {
                return;
            }

            options.legend.labelFormatter = function(label, series, mylabel) {
                var buttonIdx = label.indexOf('[hide]');
                if (buttonIdx == -1) {
                    buttonIdx = label.indexOf('[show]');
                }
                var button = '';
                var labelText = label;
                if (buttonIdx > -1) {
                    labelText = label.slice(0, buttonIdx);
                    button = label.slice(buttonIdx);
                }
								if (series.longlabel) {
	                var labelLink = '<span title="' + series.longlabel + '" class="graphlabel">' + labelText;
								} else {
	                var labelLink = '<span class="graphlabel">' + labelText;
								}
                if (button) {
                    labelLink += '<a class="graphlabellink" style="cursor:pointer;">' + button + '</a>';
                }
                labelLink += '</span>';
                return labelLink;
            };

            // Really just needed for initial draw; the mouse-enter/leave functions will
            // call plotLabelHandlers() directly, since they only call setupGrid().
            plot.hooks.draw.push(function (plot, ctx) {
                plotLabelHandlers(plot, options);
            });
        }

        plot.hooks.processOptions.push(checkOptions);

        function hideDatapointsIfNecessary(plot, s, datapoints) {
            if (!s.points.show && !s.lines.show) {
                s.datapoints.format = [ null, null ];
            }
        }

        plot.hooks.processDatapoints.push(hideDatapointsIfNecessary);
    }

    $.plot.plugins.push({
        init: init,
        options: options,
        name: 'hiddenGraphs',
        version: '1.0'
    });

})(jQuery);

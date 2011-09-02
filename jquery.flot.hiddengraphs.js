/* ***** BEGIN LICENSE BLOCK *****
 * Version: MPL 1.1/GPL 2.0/LGPL 2.1
 *
 * The contents of this file are subject to the Mozilla Public License Version
 * 1.1 (the "License"); you may not use this file except in compliance with
 * the License. You may obtain a copy of the License at
 * http://www.mozilla.org/MPL/
 *
 * Software distributed under the License is distributed on an "AS IS" basis,
 * WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License
 * for the specific language governing rights and limitations under the
 * License.
 *
 * The Original Code is flot-hiddengraphs.
 *
 * The Initial Developer of the Original Code is
 * the Mozilla Foundation.
 * Portions created by the Initial Developer are Copyright (C) 2011
 * the Initial Developer. All Rights Reserved.
 *
 * Contributor(s):
 *     Mark Cote <mcote@mozilla.com>
 *     William Lachance <wlachance@mozilla.com>
 *
 * Alternatively, the contents of this file may be used under the terms of
 * either the GNU General Public License Version 2 or later (the "GPL"), or
 * the GNU Lesser General Public License Version 2.1 or later (the "LGPL"),
 * in which case the provisions of the GPL or the LGPL are applicable instead
 * of those above. If you wish to allow use of your version of this file only
 * under the terms of either the GPL or the LGPL, and not to allow others to
 * use your version of this file under the terms of the MPL, indicate your
 * decision by deleting the provisions above and replace them with the notice
 * and other provisions required by the GPL or the LGPL. If you do not delete
 * the provisions above, a recipient may use your version of this file under
 * the terms of any one of the MPL, the GPL or the LGPL.
 *
 * ***** END LICENSE BLOCK ***** */

/*
 * Plugin to hide series in flot graphs.
 *
 * To activate, set legend.hideable to true in the flot options object.
 * To hide one or more series by default, set legend.hidden to an array of label strings.
 *
 * At the moment, this only works with line graphs and assumes that points.show and
 * lines.show are both true.
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
        var labelHidden = ' [hidden]';

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

            if (series.points.show) {
                series.points.show = false;
                series.lines.show = false;
                series.label += labelHidden;
                series.oldColor = series.color;
                series.color = "#ddd";
            } else {
                series.points.show = true;
                series.lines.show = true;
                series.label = series.label.replace(labelHidden, '');
                series.color = series.oldColor;
            }

            // HACK: Reset the data, triggering recalculation of graph bounds
            plot.setData(plot.getData());

            plot.setupGrid();
            plot.draw();
        }

        function plotLabelHandlers(plot, options) {
            $(".graphlabel").mouseenter(function() { $(this).css("cursor", "pointer"); })
                            .mouseleave(function() { $(this).css("cursor", "default"); })
                            .click(function() { plotLabelClicked($(this).parent().text()); });
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

            options.legend.labelFormatter = function(label, series) {
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
                var labelLink = '<span class="graphlabel">' + labelText;
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

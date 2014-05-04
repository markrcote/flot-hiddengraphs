flot-hiddengraphs: flot plugin to hide series
=============================================

https://github.com/markrcote/flot-hiddengraphs

To activate, set `legend.hideable` to `true` in the flot `options` object.
To hide one or more series by default, set `legend.hidden` to an array of
label strings.

Series are hidden and shown by clicking on the associated legend label.

At the moment, this only works with line and point graphs.

Example
-------

    var plotdata = [{data: [[1, 1], [2, 1], [3, 3], [4, 2], [5, 5]],
                     label: "graph 1"},
                    {data: [[1, 0], [2, 1], [3, 0], [4, 4], [5, 3]],
                     label: "graph 2"}];

    plot = $.plot($("#placeholder"), plotdata, {
        series: {
            points: { show: true },
            lines: { show: true }
        },
        legend: {
            hideable: true,
            hidden: ["graph 1"]
        }
    });


To do
-----

* Support other types of graphs than just points and lines
* Make mouseovers a little less flakey; mouseout events are sometimes missed

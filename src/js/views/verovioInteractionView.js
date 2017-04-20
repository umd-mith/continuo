var $ = global.jQuery = require('jquery');
require('../../../lib/jquery-xpath/jquery.xpath');

import * as Backbone from 'backbone';
import ns from '../utils/namespace';
import Measures from '../data/coll-measures';
import '../mei/meiprocessing';
import SVGProc from '../utils/svgprocessing';
import Events from '../utils/backbone-events';

// Note on Variable Prefixes
// $varname is a jQuery object
// XPvarname is an XPath object

class VerovioInteractionView extends Backbone.View {

    events() {
        return {
            'mousedown svg': 'startSelect',
            'mousemove': 'areaSelect',
            'mouseup'  : 'stopSelect',
            'mousedown g.cnt-selectable'  : 'startSelect'
        }
    }

    initialize() {
        this.$MEIdata = $(this.model.get("doc"));
        this.measures = new Measures();

        // Flags for monitoring clicks and drags.
        this.selecting = false;
        this.dragging = false;
    }

    addMusEvent($mei_el) {
        $mei_el = $mei_el.parent();
        var ev_id = $mei_el.attr("id");
        var XPevent = this.$MEIdata.xpath("//*[@xml:id='"+ev_id+"']");

        if (!$mei_el.hasClass("cnt-selected")) {
            $mei_el.addClass("cnt-selected");

            let XPmeasure = XPevent.xpath("ancestor::mei:measure[1]", ns);
            let measure_id = XPmeasure.xpath('@xml:id').val();

            let XPstaff = XPevent.xpath("ancestor::mei:staff[1]", ns);
            let staff_id = XPstaff.xpath('@xml:id').val();
            let measure_idx = XPmeasure.xpath("preceding::mei:measure[ancestor::mei:music]", ns).length + 1;

            var measure = this.measures.get(measure_id);
            if (!measure) {
                measure = this.measures.add({
                    "measure" : XPmeasure,
                    "id" : measure_id,
                    "index" : measure_idx
                });
            }

            let staves = measure.get("staves");
            var staff = staves.get(staff_id);
            var staff_idx = XPstaff.xpath("preceding-sibling::mei:staff", ns).length + 1;

            if (!staff) {
                staff = staves.add({
                    "staff": XPstaff,
                    "id" : staff_id,
                    "index" : staff_idx
                });
            }

            let beats = staff.get("beats");
            let beat = XPevent.getEventBeat();
            let storedBeat = beats.filter(function (b) { return b.get("value") === beat; });
            if (storedBeat.length == 0){
                beats.add({
                    "event" : XPevent.xpath('@xml:id').val(),
                    "value" : beat
                });
            }

            let emaExpr = this.measures.generateOptimizedEMAExpr();
            Events.trigger('component:emaBox', emaExpr);
        }
        else {
            //noop
        }
    }

    removeMusEvent($mei_el){
        $mei_el = $mei_el.parent();
        var ev_id = $mei_el.attr("id");
        var XPevent = this.$MEIdata.xpath("//*[@xml:id='"+ev_id+"']");

        if ($mei_el.hasClass("cnt-selected")) {
            $mei_el.removeClass("cnt-selected");

            let event_id = XPevent.xpath('@xml:id').val();

            let XPmeasure = XPevent.xpath("ancestor::mei:measure[1]", ns);
            let measure_id = XPmeasure.xpath('@xml:id').val();

            let XPstaff = XPevent.xpath("ancestor::mei:staff[1]", ns);
            let staff_id = XPstaff.xpath('@xml:id').val();

            let beat = XPevent.getDurationToMeter();

            let measure = this.measures.get(measure_id);
            let staves = measure.get("staves");
            let staff = staves.get(staff_id);
            let beats = staff.get("beats");

            let storedBeat = beats.filter(function (b) { return b.get("event") === event_id; });

            if (storedBeat.length == 1) {
                beats.remove(storedBeat);
            }
            else {
                // not tested
                let storedBeat = beats.filter(function (b) { return b.get("value") === beat; });
                beats.remove(storedBeat);
            }

            // Remove staff if it contains no more beats
            if (beats.length == 0) {
                staves.remove(staff_id);
            }

            // Remove measure if it contains no more staves
            if (staves.length == 0) {
                this.measures.remove(measure_id);
            }

            let emaExpr = this.measures.generateOptimizedEMAExpr();
            Events.trigger('component:emaBox', emaExpr);
        } else {
            //noop
        }
    }

    startSelect(e) {
        e.preventDefault();
        this.selecting = true;


        let $ct = $(e.currentTarget);
        if ($ct.is("g.cnt-selectable")){
            // remove on Ctrl or ⌘.
            if (e.ctrlKey || e.metaKey) {
                this.removeMusEvent($ct);
            }
            else {
                this.addMusEvent($ct);
            }
        }

    }

    areaSelect(e) {
        e.preventDefault();
        if (this.selecting) {
            this.dragging = true;

            let vrv_page = SVGProc.getSVGRoot(e.target);
            let s = $(vrv_page).find(".cnt-areaSel");
            let loc = SVGProc.getSVGCoordinates({"x": e.clientX, "y" : e.clientY}, vrv_page);
            if(s.length > 0) {

                let d = {
                    "x"      : parseInt(s.attr("x")),
                    "y"      : parseInt(s.attr("y")),
                    "width"  : parseInt(s.attr("width")),
                    "height" : parseInt(s.attr("height"))
                },
                move = {
                    "x" : loc.x - d.x,
                    "y" : loc.y - d.y
                };

                if( move.x < 1 || (move.x*2<d.width)) {
                    d.x = loc.x;
                    d.width -= move.x;
                } else {
                    d.width = move.x;
                }

                if( move.y < 1 || (move.y*2<d.height)) {
                    d.y = loc.y;
                    d.height -= move.y;
                } else {
                    d.height = move.y;
                }

                s.attr(d);

            }
            else {
                let rect_attrs = {
                    "rx"     : 6,
                    "ry"     : 6,
                    "class"  : "cnt-areaSel",
                    "x"      : loc.x,
                    "y"      : loc.y,
                    "width"  : 0,
                    "height" : 0
                };
                let rect = SVGProc.makeSVGEl("rect", rect_attrs);
                vrv_page.appendChild(rect);
            }
        }
    }

    stopSelect(e){
        e.preventDefault();

        if (this.dragging) {
            let vrv_page = SVGProc.getSVGRoot(e.target);
            // Find selectable elements intersecting the selection rectangle
            let s = $(vrv_page).find(".cnt-areaSel");
            let d = {
                "x": parseInt(s.attr("x")),
                "y": parseInt(s.attr("y")),
                "width": parseInt(s.attr("width")),
                "height": parseInt(s.attr("height")),
            }
            d.right = d.x+d.width;
            d.bottom = d.y+d.height;

            $(vrv_page).find("g.cnt-selectable").each((i, ev) => {
                let bcr = ev.getBoundingClientRect();
                let ev_rect = {};

                // We need to transform this according to the hosting SVG
                let pt_tl = SVGProc.getSVGCoordinates({
                    "x": bcr.left,
                    "y": bcr.top
                }, vrv_page);
                ev_rect.left = pt_tl.x;
                ev_rect.top = pt_tl.y;

                let pt_br = SVGProc.getSVGCoordinates({
                    "x": bcr.right,
                    "y": bcr.bottom
                }, vrv_page);
                ev_rect.right = pt_br.x;
                ev_rect.bottom = pt_br.y;

                if (
                    (ev_rect.left >= d.x && ev_rect.left <= d.right &&
                    ev_rect.top >= d.y && ev_rect.top <= d.bottom)
                    &&
                    (ev_rect.right >= d.x && ev_rect.right <= d.right &&
                    ev_rect.bottom >= d.y && ev_rect.bottom <= d.bottom)
                ) {
                    // remove on Ctrl or ⌘.
                    if (e.ctrlKey || e.metaKey) {
                        this.removeMusEvent($(ev));
                    }
                    else {
                        this.addMusEvent($(ev));
                    }
                }

            });

            // Remove selection rectangle
            s.remove();
        }

        // Reset mouse flags.
        this.selecting = false;
        this.dragging = false;

    }

}

export default VerovioInteractionView;

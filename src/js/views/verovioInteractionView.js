var $ = global.jQuery = require('jquery');
require('../../../node_modules/jquery-xpath/jquery.xpath');

import * as Backbone from 'backbone';
import ns from '../utils/namespace';
import Measures from '../data/coll-measures';
import '../mei/meiprocessing';
import Events from '../utils/backbone-events';

// Note on Variable Prefixes
// $varname is a jQuery object
// XPvarname is an XPath object

class VerovioInteractionView extends Backbone.View {

    events() {
        return {
            'click g.note' : 'toggleFullEvent',
            'click g.rest' : 'toggleFullEvent'
        }
    }

    initialize() {
        this.$MEIdata = $(this.model.get("doc"));
        this.measures = new Measures();
    }

    toggleFullEvent(e) {
        var $mei_el = $(e.currentTarget);
        var ev_id = $mei_el.attr("id");  
        var XPevent = this.$MEIdata.xpath("//*[@xml:id='"+ev_id+"']");

        if (!$mei_el.hasClass("cnt-selected")) {
            $mei_el.addClass("cnt-selected");                      

            let XPmeasure = XPevent.xpath("ancestor::mei:measure[1]", ns);
            let measure_id = XPmeasure.xpath('@xml:id').val();

            let XPstaff = XPevent.xpath("ancestor::mei:staff[1]", ns);
            let staff_id = XPstaff.xpath('@xml:id').val();
            let measure_idx = XPmeasure.xpath("preceding::mei:measure", ns).length + 1;

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
        }
    }

}

export default VerovioInteractionView;
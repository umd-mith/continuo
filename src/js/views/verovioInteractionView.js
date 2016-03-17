var $ = global.jQuery = require('jquery');
require('../../../node_modules/jquery-xpath/jquery.xpath');

import * as Backbone from 'backbone';
import ns from '../utils/namespace';
import Measures from '../data/coll-measures';
import '../mei/meiprocessing';

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

        if (!$mei_el.hasClass("selected")) {
            $mei_el.addClass("selected");                      

            let XPmeasure = XPevent.xpath("ancestor::mei:measure[1]", ns);
            let measure_id = XPmeasure.xpath('@xml:id').val();

            let XPstaff = XPevent.xpath("ancestor::mei:staff[1]", ns);
            let staff_id = XPstaff.xpath('@xml:id').val();

            var measure = this.measures.get(measure_id);
            if (!measure) {
                measure = this.measures.add({
                    "measure" : XPmeasure,
                    "id" : measure_id
                });
            }

            let staves = measure.get("staves");
            var staff = staves.get(staff_id);

            if (!staff) {
                staff = staves.add({
                    "staff": XPstaff,
                    "id" : staff_id  
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

            console.log(this.measures);
        }
        else {
            $mei_el.removeClass("selected");

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
                console.log(beats);
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

            console.log(this.measures);
        }
    }

}

export default VerovioInteractionView;
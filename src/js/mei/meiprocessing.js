var $ = require('jquery');
require('../../../lib/jquery-xpath/jquery.xpath');

import ns from '../utils/namespace';

var meiprocessing = {};

meiprocessing.getClosestMeter = function() {
    let XPevent = this;
    let XPscoreDef = XPevent.xpath("preceding::mei:scoreDef[1]", ns);

    // Process for beat data if the scoreDef defines meter, otherwise lookback
    let count = XPscoreDef.attr("meter.count");
    let unit = XPscoreDef.attr("meter.unit");
    if (!count || !unit) {
        let count_elm = XPscoreDef.xpath("descendant::mei:meterSig", ns);
        if (count_elm.length > 0){
            // Remove throw error.
            // if (count_elm.length > 1) {
            //    throw "Mixed meter is not supported";
            // }
            let count = $(count_elm[0]).xpath("@count").val();
            let unit = $(count_elm[0]).xpath("@unit").val();
            if (!count || !unit){
                throw "Could not locate meter and compute beats";
            }
            return {"count" : count, "unit" : unit}
        }
        // No meter specified, lookback
        else {
            return meiprocessing.getClosestMeter.apply(XPscoreDef);
        }
    }
    return {"count" : count, "unit" : unit}
}

meiprocessing.getDurationToMeter = function() {
    let XPevent = this;

    if (XPevent.xpath("self::mei:mRest", ns).length > 0){
        return "all";
    }
    else {
        let dur = XPevent.xpath("@dur").val();
        if (!dur){ throw "Element has no duration." }
        let dots = 0;
        if (dur == "breve"){
            dur = 0.5;
        }
        else if (dur == "long") {
            dur = 0.25;
        }
        dur = Number(dur);
        let attr = XPevent.xpath("@dots").val();
        let els = XPevent.xpath("dot");
        if (attr) {
            dots = parseInt(attr);
        }
        else if (els) {
            dots = els.length;
        }

        // Calculate duration relative to meter
        let meter = meiprocessing.getClosestMeter.apply(this);
        var relative_dur = meter.unit / dur;

        var dot_dur = dur;
        for (let d of Array.from(new Array(dots), (x,i) => i)) {
            dot_dur = dot_dur * 2;
            relative_dur += meter.unit / dot_dur;
        }

        // Adjust duration if this event is contained in a tuplet
        // TODO: deal with teupletspan
        let XPtupl = XPevent.xpath("ancestor::mei:tuplet", ns);
        if (XPtupl.length > 0) {
            let numbase = XPtupl.xpath("@numbase");
            let num = XPtupl.xpath("@num");

            if (!num || !numbase) {
                throw "Cannot understand tuplet beat: both @num and @numbase must be present";
            }
            else {
                let tupl_ratio = parseFloat(numbase.val()) / parseFloat(num.val());
                relative_dur = relative_dur * tupl_ratio;
            }

        }

        return relative_dur;
    }

};

meiprocessing.getEventBeat = function() {
    let XPevent = this;

    if (XPevent.xpath("self::mei:mRest", ns).length > 0){
        return "all";
    }
    else {
        let dur = XPevent.xpath("@dur").val();
        if (!dur){ throw "Element has no duration." }

        var beat = 1.0;

        // This is a bit inefficient because xpath.js doesn't support generate-id().
        let XPstaff = XPevent.xpath("ancestor::mei:staff[1]", ns);
        for (let el of XPstaff.xpath("descendant::*[@dur][not(@grace)]")){
            let $el = $(el);
            if ($el.attr("xml:id") == XPevent.attr("xml:id")) {
                break;
            }
            beat += meiprocessing.getDurationToMeter.apply($el);
        }

        return parseFloat(beat.toFixed(4));
    }

}

$.extend($.prototype, meiprocessing);

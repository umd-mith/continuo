var $ = global.jQuery = require('jquery');
require('../../../node_modules/jquery-xpath/jquery.xpath');

import ns from '../utils/namespace';

var meiprocessing = {};

meiprocessing.getClosestMeter = function() {
    let XPevent = this;
    let XPscoreDef = XPevent.xpath("preceding::mei:scoreDef[1]", ns);

    // Process for beat data if the scoreDef defines meter, otherwise lookback
    let count = XPscoreDef.attr("meter.count");
    let unit = XPscoreDef.attr("meter.unit");
    // let count = XPscoreDef.xpath("@meter.count").val();
    // let unit = XPscoreDef.xpath("@meter.unit").val();
    if (!count || !unit) {
        count_elm = XPscoreDef.xpath("descendant::mei:meterSig", ns);
        if (count_elm){
            // (not tested)
            if (count_elm.length > 1) {
                throw "Mixed meter is not supported";
            }
            count = count_elm[0].xpath("@count").val();
            unit = count_elm[0].xpath("@unit").val();
            if (!count || !unit){
                throw "Could not locate meter and compute beats";
            }
        }
        // No meter specified, lookback (not tested)
        else {
            meiprocessing.getClosestMeter.apply(this);
        }
    }
    return {"count" : count, "unit" : unit}
}

meiprocessing.getDurationToMeter = function() {
    let XPevent = this;
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

    return relative_dur;

};

meiprocessing.getEventBeat = function() {
    let XPevent = this;
    let dur = XPevent.xpath("@dur").val();
    if (!dur){ throw "Element has no duration." }

    var beat = 1.0;

    // This is a bit inefficient because xpath.js doesn't support generate-id().
    let XPstaff = XPevent.xpath("ancestor::mei:staff[1]", ns);
    for (let el of XPstaff.xpath("descendant::*[@dur][not(@grace)]")){
        let $el = $(el);
        if ($el.is(XPevent)) {
            break;
        }
        beat += meiprocessing.getDurationToMeter.apply($el);
    }

    return beat;
    
}

$.extend($.prototype, meiprocessing);
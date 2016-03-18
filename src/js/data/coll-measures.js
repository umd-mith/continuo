import * as Backbone from 'backbone';
import Measure from './model-measure.js';

class Measures extends Backbone.Collection {
    constructor() {
        super();
        this.model = Measure;
        // Keep sorted by index value
        this.comparator = "index";
    }

    generateOptimizedEMAExpr() {

        let _makeIndexRange = function (s, i, m, c, sep) {
            let m_idx = m.get("index");
            if (i > 0){
                let prev_idx = c[i-1].get("index");                    
                if (m_idx == prev_idx+1) {
                    // IT'S CONTINGUOS: MERGE
                    if (!s.endsWith("-")) {
                        s += "-";
                    }
                    if (c[i+1]){
                        let next_idx = c[i+1].get("index");
                        if (m_idx+1 != next_idx){
                            // End of range
                            s += m_idx;
                        }                 
                    }
                    else {
                        // End of range
                        s += m_idx;
                    }

                }  
                else {
                    // NOT CONTIGUOS: ADD
                    s += sep + m_idx;
                }                  
            }
            else {
                // START
                s += m_idx;
            } 

            return s;
        }
        
        let sMeasures = "";
        let sStaves = "";
        let sBeats = "";

        let measures = this.models;
        for (let [i, measure] of measures.entries()) {

            sMeasures = _makeIndexRange(sMeasures, i, measure, measures, ",");

            let staves = measure.get("staves").models;
            for (let [i, staff] of staves.entries()) {

                sStaves = _makeIndexRange(sStaves, i, staff, staves, "+");

                let evs = staff.get("events");
                let beats = staff.get("beats").models;
                for (let [i, beat] of beats.entries()) {
                    // Determine if this beat is contiguos to the previous one
                    let cur_ev = beat.get("event");
                    let i_ev = evs.indexOf(cur_ev);
                    if (i > 0){
                        let prev_b = beats[i-1].get("event");
                        if (i_ev < 0){
                            throw "Unexpected: cannot find event in list of events with beat."
                        }
                        if (evs[i_ev-1] == prev_b){
                            // IT'S CONTINGUOS: MERGE
                            if (!sBeats.endsWith("-")) {
                                sBeats += "-";
                            }
                            if (beats[i+1]) {
                                let next_b = beats[i+1].get("event");
                                if (evs[i_ev+1] != next_b){
                                    // End of range
                                    sBeats += beat.get("value");
                                }                                
                            }
                            else {
                                // End of range
                                sBeats += beat.get("value");
                            }                             
                        }
                        else {
                            // NOT CONTIGUOS: ADD
                            sBeats += "@" + beat.get("value");
                        }
                    }
                    else {
                        // NOT CONTIGUOS: ADD
                        sBeats += "@" + beat.get("value");
                    }
                }

                if (staves[i+1]) {
                    sBeats += "+";
                }

            }

            if (measures[i+1]) {
                sStaves += ",";
                sBeats += ",";
            }            

        }

        if (sMeasures && sStaves && sBeats) {
            return sMeasures + '/' + sStaves + '/' + sBeats;            
        }
        else {
            return "";
        }

    }

    generateEMAExpr() {

    }
}

export default Measures;
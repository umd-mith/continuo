import $ from 'jquery';
import * as Backbone from 'backbone';
import Beats from './coll-beats';

class Staff extends Backbone.Model {
    constructor(options) {
        super(options);
        this.set("beats", new Beats());
    }

    initialize(){
        // Compute list of ids for events that can be tarets via beats
        let XPstaff = this.get("staff");
        let events = []
        for (let el of XPstaff.xpath("descendant::*[@dur][not(@grace)]")){
            events.push($(el).xpath("@xml:id").val());  
        } 
        this.set("events", events);
    }
}

export default Staff;
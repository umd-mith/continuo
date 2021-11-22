var $ = require('jquery');
require('../../../lib/jquery-xpath/jquery.xpath');

import * as Backbone from 'backbone';

class MEIdata extends Backbone.Model {

    generate_ids() {
        // Add ids to all elements if they don't have one aleady.
        let doc = this.get("doc");
        let $doc = $(doc);

        for (let el of $doc.xpath("//*")){
            let $el = $(el);
            if (!$el.xpath("@xml:id").val()) {
                let rnd ='CNT-' + Math.random().toString(36).substr(2, 9);
                el.setAttributeNS("http://www.w3.org/XML/1998/namespace", "xml\:id", rnd);
            }
        }

        // Update string data
        this.set("string", new XMLSerializer().serializeToString(doc));

    }

}

export default MEIdata;

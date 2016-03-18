import * as Backbone from 'backbone';
import Beat from './model-beat.js';

class Beats extends Backbone.Collection {
    constructor() {
        super();
        this.model = Beat;
        // Keep sorted by beat value
        this.comparator = "value";
    }

    generateEMAExpr() {
        
    }

}

export default Beats;
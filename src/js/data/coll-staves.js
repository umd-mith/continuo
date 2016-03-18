import * as Backbone from 'backbone';
import Staff from './model-staff.js';

class Staves extends Backbone.Collection {
    constructor() {
        super();
        this.model = Staff;
        // Keep sorted by index value
        this.comparator = "index";
    }

    generateEMAExpr() {
        
    }
}

export default Staves;
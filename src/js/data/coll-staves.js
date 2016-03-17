import * as Backbone from 'backbone';
import Staff from './model-staff.js';

class Staves extends Backbone.Collection {
	constructor() {
		super();
		this.model = Staff;
	}
}

export default Staves;
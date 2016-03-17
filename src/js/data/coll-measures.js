import * as Backbone from 'backbone';
import Measure from './model-measure.js';

class Measures extends Backbone.Collection {
	constructor() {
		super();
		this.model = Measure;
	}
}

export default Measures;
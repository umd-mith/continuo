import * as Backbone from 'backbone';
import Beat from './model-beat.js';

class Beats extends Backbone.Collection {
	constructor() {
		super();
		this.model = Beat;
	}
}

export default Beats;
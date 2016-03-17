import * as Backbone from 'backbone';
import Staves from '../data/coll-staves';

class Measure extends Backbone.Model {
	constructor(options) {
		super(options);
		this.set("staves", new Staves());
	}
}

export default Measure;
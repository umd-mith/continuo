import * as Backbone from 'backbone';
import Beats from './coll-beats';

class Staff extends Backbone.Model {
	constructor(options) {
		super(options);
		this.set("beats", new Beats());
	}
}

export default Staff;
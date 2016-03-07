import $ from 'jquery';
import * as Backbone from 'backbone';

class Continuo extends Backbone.View {

	initialize(options) {
        this.mei = options.mei;
        this.MEIdata = this.getMEIdata();
    }

    getMEIdata(cb){
    	$.get(this.mei, (data) => {
    		this.MEIdata = data;
    		if (cb) {
	    		cb();
	    	}
    	});
    }

    render(){
    	if (this.MEIdata) {    		
    		// Sadly, importing Verovio crashes babelify
			let vrvToolkit = new verovio.toolkit();
			let scale = 50;
			let options = JSON.stringify({
			    pageWidth: this.$el.width() * 100 / scale,
			    ignoreLayout: 1,
			    adjustPageHeight: 1,
			    border: 50,
			    scale: scale
			});
			vrvToolkit.setOptions(options);
			let mei = new XMLSerializer().serializeToString(this.MEIdata);
			vrvToolkit.loadData( mei + "\n", "" );
			let pgs = vrvToolkit.getPageCount();
			for (let page of Array.from(new Array(pgs), (x,i) => i)) {
				let svg = vrvToolkit.renderPage(page+1);
			    this.$el.append(svg);
			}
    	}
    	else {
    		// bind(this) preserves the context
    		this.getMEIdata(this.render.bind(this));
    	}
    }

}

// Make main class available to pre-ES6 browser environments 
if (window) {
	window.Continuo = Continuo;
}
export default Continuo;
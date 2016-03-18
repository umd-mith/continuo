import $ from 'jquery';
import * as Backbone from 'backbone';
import VerovioInteractionView from './views/verovioInteractionView';
import MEIdata from './data/model-MEIdata';
import Events from './utils/backbone-events';

class Continuo extends Backbone.View {

	initialize(options) {
        this.mei = options.mei;
        this.listenTo(Events, 'component:emaBox', this.updateEmaBox);
    }

    getMEIdata(cb){
    	$.get(this.mei, (data) => {            
    		this.MEIdata = new MEIdata(
    			{"doc": data, 
    			 "string": new XMLSerializer().serializeToString(data)
    			});
            this.MEIdata.generate_ids();
    		if (cb) {
	    		cb();
	    	}
    	});
    }
  
    updateEmaBox(expr){
        $(".cnt-emabox").show();
        $(".cnt-emabox").text(expr);
    }

    render(){
    	if (this.MEIdata) { 
    		let container = $("<div class='cnt-container'></div>");
    		this.$el.append(container);

            // Create EMA floating box
            let emaBox = $("<div class='cnt-emabox'></div>");
            container.append(emaBox);

            // Create score

    		// Sadly, importing Verovio crashes babelify, 
    		// so we assume it's globally available
    		// i.e. verovio must be defined.
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
			let mei = this.MEIdata.get("string");
			vrvToolkit.loadData( mei + "\n", "" );
			let pgs = vrvToolkit.getPageCount();
			for (let page of Array.from(new Array(pgs), (x,i) => i)) {
				let svg = vrvToolkit.renderPage(page+1);

			    container.append(svg);
			}
			new VerovioInteractionView({"el": container, "model": this.MEIdata});
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
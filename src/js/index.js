import $ from 'jquery';
import * as Backbone from 'backbone';
import VerovioInteractionView from './views/verovioInteractionView';
import MEIdata from './data/model-MEIdata';
import Events from './utils/backbone-events';
import extend_vrv from './utils/verovio-ext';
import FileUploadComponent from './components/fileupload';
import 'xmldom';

// NOTES
// jQuery is only used for HTML DOM operations. All XML DOM operations require xmldom.

class Continuo extends Backbone.View {

    initialize(options) {
        this.mei = options.mei;
        this.listenTo(Events, 'component:emaBox', this.updateEmaBox);
        this.listenTo(Events, 'addFile', this.addFile);
    }
  
    updateEmaBox(expr){
        $(".cnt-emabox").show();
        $(".cnt-emabox").text(expr);
    }

    addFile(textData) {
        // Create score

        let container = this.$el.find(".cnt-container");

        let doc = new DOMParser().parseFromString(textData["string"], 'text/xml');
        this.MEIdata = new MEIdata(
            {"doc": doc, 
             "string": textData["string"]
            });

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
        let mei = textData["string"];
        vrvToolkit.loadData( mei + "\n", "" );
        let pgs = vrvToolkit.getPageCount();
        for (let page of Array.from(new Array(pgs), (x,i) => i)) {
            let svg = vrvToolkit.renderPage(page+1);

            let ext_svg = extend_vrv(svg);
            container.append(ext_svg);
        }
        new VerovioInteractionView({"el": container, "model": this.MEIdata});
    }

    render(){        
        let container = $("<div class='cnt-container'></div>");
        this.$el.append(container);

        // Create EMA floating box
        let emaBox = $("<div class='cnt-emabox'></div>");
        container.append(emaBox);

        new FileUploadComponent({"el":container});
    }

}

// Make main class available to pre-ES6 browser environments 
if (window) {
    window.Continuo = Continuo;
}
export default Continuo;
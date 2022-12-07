import $ from 'jquery';
import * as Backbone from 'backbone';
import VerovioInteractionView from './views/verovioInteractionView';
import HighlightView from './views/highlightView';
import MEIdata from './data/model-MEIdata';
import Events from './utils/backbone-events';
import extend_vrv from './utils/verovio-ext';
import EMAExprComponent from './components/EMAexpr';
import Pagination from './components/pagination';
import ns from './utils/namespace';

class Continuo extends Backbone.View {

    initialize(options) {

        this.mei = options.mei;
        this.meiString = options.meiString;
        this.omas = options.omas;
        this.verovioToolkit = options.verovioToolkit;
        this.verovioOptions = options.verovioOptions;
        this.paginate = options.paginate;
        this.showPageCtrls =
          options.showPageCtrls === null || options.showPageCtrls === undefined ? true
          : options.showPageCtrls
        this.page = 1;
        this.selectedElements = [];
        this.highlightedElements = [];
        this.listenTo(Events, 'addFile', this.addFile);
        this.listenTo(Events, 'component:pagination:next', () => {this.renderPage(this.page+1)});
        this.listenTo(Events, 'component:pagination:prev', () => {this.renderPage(this.page-1)});
    }

    addFile(textData) {
        // Create score
        let container = this.$el.find(".cnt-container");
        this.EMAComponent.trigger('component:emaBox:url', textData["url"]);

        let doc = new DOMParser().parseFromString(textData["string"], 'text/xml');
        this.MEIdata = new MEIdata(
            {"doc": doc,
             "string": textData["string"]
            });
        this.MEIdata.generate_ids();

        // Sadly, importing Verovio crashes babelify,
        // so we assume it's globally available
        // i.e. verovio must be defined.
        let vrvToolkit = this.verovioToolkit ? this.verovioToolkit : new verovio.toolkit();
        this.vrvToolkit = vrvToolkit;
        let scale = 50
        let options = this.verovioOptions ? this.verovioOptions : {
            pageWidth: this.$el.width() * 100 / scale,
            pageHeight: this.$el.height() * 100 / scale,
            ignoreLayout: 1,
            adjustPageHeight: 1,
            border: 50,
            scale: scale
        };
        vrvToolkit.setOptions(options);
        let mei = textData["string"];
        vrvToolkit.loadData( mei + "\n", "" );

        if (this.paginate) {
          this.page = 1;
          let svg = vrvToolkit.renderToSVG(1);
          let ext_svg = extend_vrv(svg);
          container.append(ext_svg);
        }
        else {
          let pgs = vrvToolkit.getPageCount();
          for (let page of Array.from(new Array(pgs), (x,i) => i)) {
              let svg = vrvToolkit.renderPage(page+1);

              let ext_svg = extend_vrv(svg);
              container.append(ext_svg);
          }
        }
        this.interView = new VerovioInteractionView({"el": container, "model": this.MEIdata});
        this.interView.on("component:emaBox", (expr) => this.EMAComponent.trigger("component:emaBox", expr));
        this.interView.on('selectElement', (id) => {this.selectedElements.push(id); this.trigger("selected", id)});
        this.interView.on('deselectElement', (id) => {
          let index = this.selectedElements.indexOf(id)
          if (index > -1) {
              this.selectedElements.splice(index, 1);
          }
          this.trigger("deselected", id)
        });

        // Determine if notation must be highlighted
        let api_opts = textData["url"].split("/").pop();
        if (api_opts.includes("highlight")) {
            new HighlightView({"el": container, "model": this.MEIdata});
        }

    }

    clearSelection() {
        for (let sel of this.selectedElements) {
          let $sel = this.$el.find("#"+sel)
          let class_att = $sel.attr("class")
          if (class_att) {
            let classes = class_att.split(" ")
            classes.splice(classes.indexOf(".cnt-selected"), 1)
            $sel.attr("class", classes.join(" "))
          }
        }
        this.interView.clearMusEvents()
        this.selectedElements = []
        this.trigger("clearedSelection")
    }

    addMusEventFromId(id) {
      this.interView.addMusEventFromId(id)
    }

    highlight(ids){
      this.highlightedElements = ids
      this.renderPage(this.page)
    }

    clearHighlight(){
      this.highlightedElements = []
      this.renderPage(this.page)
    }

    render(){
        let container = $("<div class='cnt-container'></div>");
        this.$el.append(container);

        // Create EMA floating box
        this.EMAComponent = new EMAExprComponent()
        container.append(this.EMAComponent.render());

        this.listenTo(this.EMAComponent, 'component:emaBox:clear', this.clearSelection);

        if (this.paginate && this.showPageCtrls) {
          // Create pagination floating box
          container.append(new Pagination().render());
        }

        if (this.meiString) {
          this.addFile( {
              "filename": "",
              "url": "",
              "string" : this.meiString
          });
        }
        else if (this.mei) {
            let url = this.mei;

            if (this.omas) {
                url = this.omas + encodeURIComponent(this.mei) + "/all/all/@all";
            }

            $.ajax({
                url: url,
                type: 'GET',
                dataType: 'text',
                success: (data)=>{
                    this.addFile( {
                        "filename": this.mei,
                        "url": this.mei,
                        "string" : data
                    });
                }
            });
        }

        return this.$el

    }

    renderPage (page) {
      if (page > 0 && page <= this.vrvToolkit.getPageCount()) {
        this.page = page;
        let svg = this.vrvToolkit.renderToSVG(page);
        let ext_svg = extend_vrv(svg);
        this.$el.find(".cnt-container > svg").replaceWith(ext_svg);

        // Highlight ids
        for (let id of this.selectedElements) {
          let $mei_el = this.$el.find("#"+id)
          if (!$mei_el.hasClass("cnt-selected")) {
            $mei_el.addClass("cnt-selected");
          }
        }
        for (let id of this.highlightedElements) {
          let $mei_el = this.$el.find("#"+id)
          if (!$mei_el.hasClass("cnt-highlighted")) {
            $mei_el.addClass("cnt-highlighted");
          }
        }
      }
    }

}

// Make main class available to pre-ES6 browser environments
if (window) {
    window.Continuo = Continuo;
}
export default Continuo;

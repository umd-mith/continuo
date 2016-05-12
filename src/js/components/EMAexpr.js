import $ from 'jquery';
import * as Backbone from 'backbone';
import Events from '../utils/backbone-events';
import emaexpr_tpl from '../templates/emaexpr-tpl';

class EMAExprComponent extends Backbone.View {
    
    get className() {
        return "cnt-emabox";
    }

    get events() {
        return {
            "click .cnt-emabox-cp": this.copyExpr
        }
    }

    template(tpl){
        return emaexpr_tpl(tpl);
    }

    initialize(){
        this.listenTo(Events, 'component:emaBox', this.updateEmaBox);
        this.listenTo(Events, "component:emaBox:url", (u) => {this.MEIurl = u});

    }

    copyExpr(e) {
        e.preventDefault();

        // var textArea = document.createElement("textarea");

        // // Place in top-left corner of screen regardless of scroll position.
        // textArea.style.position = 'fixed';
        // textArea.style.top = 0;
        // textArea.style.left = 0;

        // // Ensure it has a small width and height. Setting to 1px / 1em
        // // doesn't work as this gives a negative w/h on some browsers.
        // textArea.style.width = '2em';
        // textArea.style.height = '2em';

        // // We don't need padding, reducing the size if it does flash render.
        // textArea.style.padding = 0;

        // // Clean up any borders.
        // textArea.style.border = 'none';
        // textArea.style.outline = 'none';
        // textArea.style.boxShadow = 'none';

        // // Avoid flash of white box if rendered for any reason.
        // textArea.style.background = 'transparent';
        // textArea.value = this.$el.find("cnt-emaexpr").text();

        // document.body.appendChild(textArea);

        // textArea.select();

        // try {
        //     var successful = document.execCommand('copy');
        //     var msg = successful ? 'successful' : 'unsuccessful';
        //     alert('Copying text was ' + msg);
        // } catch (err) {
        //     alert('Oops, unable to copy');
        // }

        // document.body.removeChild(textArea);
    }

    updateEmaBox(expr) {
        if (expr == "") {
            this.$el.hide();
        }
        else {
            this.expr = expr;    
            // let server = "http://localhost:5000";
            let server = "http://mith.umd.edu/ema";
            let loc = window.location.origin+window.location.pathname;
            let tpl_data = {
                "expr" : expr,
                "url" : loc + "#" + server + "/" + encodeURIComponent(this.MEIurl) + "/" + this.expr
            }
            this.$el.html(this.template(tpl_data));
            this.delegateEvents(this.events);1            
        }
    }

    render() {      
      return this.$el;
    }

}

export default EMAExprComponent;
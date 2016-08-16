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
        let url = "/" + encodeURIComponent(this.MEIurl) + "/" + this.expr;
        window.prompt ("Copy to clipboard: Ctrl+C, Enter", url);
    }

    updateEmaBox(expr) {
        if (expr == "") {
            this.$el.hide();
        }
        else {
            this.expr = expr;    
            let server = "http://localhost:5000";
            // let server = "http://mith.umd.edu/ema";
            let loc = window.location.origin+window.location.pathname;
            let tpl_data = {
                "expr" : expr,
                "url" : loc + "#" + server + "/" + encodeURIComponent(this.MEIurl) + "/" + this.expr + "/highlight"
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
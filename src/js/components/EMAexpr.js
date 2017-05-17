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
            "click .cnt-emabox-x": () => {Events.trigger("component:emaBox:clear")},
            "click .cnt-emabox-cp": this.copyExpr,
            "click .cnt-emabox-hide": this.toggle
        }
    }

    template(tpl){
        return emaexpr_tpl(tpl);
    }

    initialize(){
        this.on('component:emaBox', this.updateEmaBox);
        this.on("component:emaBox:url", (u) => {this.MEIurl = u});

    }

    copyExpr(e) {
        e.preventDefault();
        let url = "/" + encodeURIComponent(this.MEIurl) + "/" + this.expr;
        window.prompt ("Copy to clipboard: Ctrl+C, Enter", url);
    }

    toggle(e) {
      e.preventDefault();
      if (this.$el.hasClass("cnt-hidden")){
        this.$el.removeClass("cnt-hidden")
      }
      else {
        this.$el.addClass("cnt-hidden")
      }
    }

    updateEmaBox(expr) {
        this.$el.show();
        this.expr = expr;
        // let server = "http://localhost:5000";
        let server = "http://mith.umd.edu/ema";
        let loc = window.location.origin+window.location.pathname;
        let tpl_data = {
            "expr" : expr,
            "url" : loc + "#" + server + "/" + encodeURIComponent(this.MEIurl) + "/" + this.expr + "/highlight"
        }
        this.$el.html(this.template(tpl_data));
        this.delegateEvents(this.events);
        if (expr == "") {
            this.$el.hide();
        }
    }

    render() {
      return this.$el;
    }

}

export default EMAExprComponent;

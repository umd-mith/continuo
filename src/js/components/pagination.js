import $ from 'jquery';
import * as Backbone from 'backbone';
import Events from '../utils/backbone-events';
import pag_tpl from '../templates/pagination-tpl';

class Pagination extends Backbone.View {

    get className() {
        return "cnt-pagination";
    }

    get events() {
        return {
            "click .cnt-pagination-next": (e) => {e.preventDefault(); Events.trigger("component:pagination:next")},
            "click .cnt-pagination-prev": (e) => {e.preventDefault(); Events.trigger("component:pagination:prev")}
        }
    }

    template(tpl){
        return pag_tpl(tpl);
    }

    initialize(){

    }

    render() {
      return this.$el.html(this.template());
    }

}

export default Pagination;

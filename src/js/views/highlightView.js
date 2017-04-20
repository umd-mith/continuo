var $ = global.jQuery = require('jquery');

import * as Backbone from 'backbone';
import ns from '../utils/namespace';

class HighlightView extends Backbone.View {

    initialize() {
        this.$MEIdata = $(this.model.get("doc"));
        this.render()
    }

    render() {
        let ids = this.$MEIdata.xpath("//mei:annot[@type='ema_highlight']/@plist", ns).val().split(" ");
        for (let id of ids) {
            $(id).addClass("cnt-highlighted");
        }
    }

}

export default HighlightView;

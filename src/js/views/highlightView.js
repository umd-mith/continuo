var $ = global.jQuery = require('jquery');
require('../../../node_modules/jquery-xpath/jquery.xpath');

import * as Backbone from 'backbone';
import ns from '../utils/namespace';
// import '../mei/meiprocessing';
// import SVGProc from '../utils/svgprocessing';
// import Events from '../utils/backbone-events';

class HighlightView extends Backbone.View {

    initialize() {
        this.$MEIdata = $(this.model.get("doc"));
        this.render()
    }

    render() {
        let ids = this.$MEIdata.xpath("//mei:annot[@type='ema_highlight']/@plist", ns).val().split(" ");
        // $(ids).addClass("cnt-highlighted")
        for (let id of ids) {
            $(id).addClass("cnt-highlighted");
        }
    }

}

export default HighlightView;
import $ from 'jquery';
import * as Backbone from 'backbone';
import '../../../lib/dropbox/dropins';
import Events from '../utils/backbone-events';
import dropbox_tpl from '../templates/dropbox-tpl';

class DropboxUploadComponent extends Backbone.View {
    
    initialize(){

        Dropbox.appKey = "gwuog2373cwj45g";

        this.$el.on('click', '.ctn-drpbtn > a', (e) => {

            let options = {
                // Required. Called when a user selects an item in the Chooser.
                success: function(files) {
                    let textdata = {
                        "filename": files[0].name,
                        "url": files[0].link
                    };
                    $.get(files[0].link).success(function (data){
                        textdata["string"] = data;
                        Events.trigger('addFile', textdata);
                        $(".cnt-controls").remove();
                    });
                },

                // Optional. Called when the user closes the dialog without selecting a file
                // and does not include any parameters.
                cancel: function() {

                },
                linkType: "direct",
                multiselect: false,
                extensions: ['.xml', '.mei'],
            };

            Dropbox.choose(options);
        });

        this.render();
    }

    render() {
      this.$el.append(dropbox_tpl);
    }

}

export default DropboxUploadComponent;
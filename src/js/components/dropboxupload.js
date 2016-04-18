import $ from 'jquery';
import * as Backbone from 'backbone';
import '../../../lib/dropbox/dropins';
import Events from '../utils/backbone-events';
import dropbox_tpl from '../templates/dropbox-tpl';

class DropboxUploadComponent extends Backbone.View {
    
    initialize(){

        Dropbox.appKey = "gwuog2373cwj45g";

        console.log(Dropbox);

        this.$el.on('click', '.ctn-drpbtn', (e) => {

            let options = {
                // Required. Called when a user selects an item in the Chooser.
                success: function(files) {
                    let textdata = {"filename": files[0].name};
                    console.log(files[0].link);
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

    showError (error) {
      switch (error.status) {
      case Dropbox.ApiError.INVALID_TOKEN:
        // If you're using dropbox.js, the only cause behind this error is that
        // the user token expired.
        // Get the user through the authentication flow again.
        break;

      case Dropbox.ApiError.NOT_FOUND:
        // The file or folder you tried to access is not in the user's Dropbox.
        // Handling this error is specific to your application.
        break;

      case Dropbox.ApiError.OVER_QUOTA:
        // The user is over their Dropbox quota.
        // Tell them their Dropbox is full. Refreshing the page won't help.
        break;

      case Dropbox.ApiError.RATE_LIMITED:
        // Too many API requests. Tell the user to try again later.
        // Long-term, optimize your code to use fewer API calls.
        break;

      case Dropbox.ApiError.NETWORK_ERROR:
        // An error occurred at the XMLHttpRequest layer.
        // Most likely, the user's network connection is down.
        // API calls will not succeed until the user gets back online.
        break;

      case Dropbox.ApiError.INVALID_PARAM:
      case Dropbox.ApiError.OAUTH_ERROR:
      case Dropbox.ApiError.INVALID_METHOD:
      default:
        // Caused by a bug in dropbox.js, in your application, or in Dropbox.
        // Tell the user an error occurred, ask them to refresh the page.
      }
    };

    render() {
      this.$el.append(dropbox_tpl);
    }

}

export default DropboxUploadComponent;
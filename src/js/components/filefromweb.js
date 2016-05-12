import $ from 'jquery';
import * as Backbone from 'backbone';
import Events from '../utils/backbone-events';
import filefromweb_tpl from '../templates/filefromweb-tpl';

class FileFromWebComponent extends Backbone.View {
    
    initialize(){

        this.$el.on('click', '.cnt-ffw > a', (e) => {
            e.preventDefault();
            this.$el.find("#cnt-ffw-input").show();
        });

        this.$el.on('click', '#cnt-ffw-input > button', (e) => {
            e.preventDefault();

            this.$el.find("#cnt-ffw-input").hide();
            this.$el.find("#cnt-ffw-loading").show();

            let url = this.$el.find("#cnt-ffw-input > input").val().trim();
            // Go via Omas to bypass CORS
            let omas_url = "http://mith.umd.edu/ema/"+encodeURIComponent(url)+"/all/all/@all" 

            let textdata = {
                "filename": "",
                "url": url
            };

            $.get(omas_url)
            .success((data) => {
                let text = new XMLSerializer().serializeToString(data);
                textdata["string"] = text;
                Events.trigger('addFile', textdata);
                $(".cnt-controls").remove();
            })
            .error((msg)=>{
                console.log(msg);
                this.$el.html("Error reading file :(");
            })
        });

        this.render();
    }

    render() {
      this.$el.append(filefromweb_tpl);
    }

}

export default FileFromWebComponent;
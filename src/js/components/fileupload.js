import $ from 'jquery';
import * as Backbone from 'backbone';
import Events from '../utils/backbone-events';
import loadfile_tpl from '../templates/loadfile-tpl';

class FileUploadComponent extends Backbone.View {

    // Components are model-less views
    
    initialize(){

        // Events
        this.$el.on('change', '.btn-file :file', (e) => {
            let input = $(e.target);
            let file = input.get(0).files[0];
            
            if (file){
                // Only process text files. -- Currently failing with .mei extension
                // if (!file.type.match('text.*')) {
                //     console.log("Wrong file type - try with an XML file");
                // }
                // else {
                    let filePromise = (new _FileReader(file)).select();

                    filePromise.then(
                        (textdata) => {
                            Events.trigger('addFile', textdata);
                    })
                    .catch(
                        (reason) => {
                            console.log(reason);
                            this.$el.html("Error reading file :(");
                    });    
                // }
                
            }
        });

        this.render();

    }

    render() {
        
        this.$el.append(loadfile_tpl);

        if (window.File && window.FileReader && window.FileList && window.Blob) {
            // noop
        } else {
            // not tested
            this.$el.html("File upload not supported in your browser :(");
            return 0;
        }

    }

}

class _FileReader {
    constructor(file){
        this.file = file;
        this.reader = new FileReader();
        this.text = "";
    }

    abortRead() {
        this.reader.abort();
    }

    errorHandler(e) {
        switch(e.target.error.code) {
          case e.target.error.NOT_FOUND_ERR:
            alert('File Not Found!');
            break;
          case e.target.error.NOT_READABLE_ERR:
            alert('File is not readable');
            break;
          case e.target.error.ABORT_ERR:
            break; // noop
          default:
            console.log('An error occurred reading this file.');
        };
    }

    select() {

        this.reader.onerror = this.errorHandler;
        this.reader.onprogress = this.updateProgress;
        this.reader.onabort = function(e) {
          console.log("File read cancelled");
        };
        this.reader.onload = (e) => {
          this.text = e.target.result;
          $("body").trigger("cnt-fl-load-done");
        }
        // Read in the file as text and return a promise
        return new Promise((resolve, reject)=>{
            this.reader.readAsText(this.file);
            $("body").on('cnt-fl-load-done', () => {
                // TODO: Unclear why this fires one extra time with empty text.
                if (this.text != "") {
                    var textdata = {"filename": this.file.name, "string" : this.text};
                    resolve(textdata);
                }
            });
        });
    }

}

export default FileUploadComponent;
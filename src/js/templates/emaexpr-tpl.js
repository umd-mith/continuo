import * as Handlebars from 'handlebars';

let emabox_tpl = `
<div class="cnt-emaexpr">{{expr}}</div>
<ul class="cnt-emabox-ctrls">
	<li><a href="{{url}}" target="_blank">Preview</a></li>
	<!--<li><a href="#" class="cnt-emabox-cp">Copy</a></li>-->
</ul>
<div class="cnt-emabox-preview"></div>
`

export default Handlebars.compile(emabox_tpl);
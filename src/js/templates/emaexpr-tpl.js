import * as Handlebars from 'handlebars';

let emabox_tpl = `
<div class="cnt-emaexpr">
	<a href="#" class="cnt-emabox-cp" title="copy">⎘</a>
	<div class="cnt-emaexpr-expr">{{expr}}</div>
</div>
`

export default Handlebars.compile(emabox_tpl);

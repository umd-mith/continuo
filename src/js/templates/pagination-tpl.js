import * as Handlebars from 'handlebars';

let pag_tpl = `
<a href="#" id="cnt-pagination-prev" title="copy">&lt;</a>
<a href="#" id="cnt-pagination-next" title="copy">&gt;</a>
`

export default Handlebars.compile(pag_tpl);

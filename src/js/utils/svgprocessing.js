import $ from 'jquery';

let SVGProc = {}

SVGProc.makeSVGEl = function (tag, attrs) {
    var el= document.createElementNS('http://www.w3.org/2000/svg', tag);
    for (var k in attrs) {
        el.setAttribute(k, attrs[k]);
    }
    return el;
}

SVGProc.getSVGCoordinates = function (coords, svg) {
    let pt = svg.createSVGPoint();
    pt.x = coords.x; pt.y = coords.y;

    return pt.matrixTransform(svg.getScreenCTM().inverse());
}

SVGProc.getSVGRoot = function (el) {
	let root_el = el;
    if (root_el.tagName != 'svg'){
        root_el = $(root_el).parents('svg').last().get(0);
    }
    return root_el;
}

export default SVGProc;
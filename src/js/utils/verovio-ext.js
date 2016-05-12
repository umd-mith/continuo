import $ from 'jquery';
import SVGProc from './svgprocessing';

let extend_vrv = function(svg){
    // Make extensions to Verovio's SVG to facilitate user interaction

    let $svg = $(svg);

    for (let el of $svg.find("g.note, g.rest, g.mRest")) {
        let $el = $(el);
        let g1_attrs = {
            "class" : "cnt-selectable"
        }
        let g1 = SVGProc.makeSVGEl("g", g1_attrs);

        let g2 = SVGProc.makeSVGEl("g");

        for (let child of $el.children()){
            if ($(child).attr('class') == 'verse'){
                $(g2).append(child);
            }
            else {
                $(g1).append(child);
            }            
        }

        $el.empty();
        $el.append(g1);
        $el.append(g2);

    }

    // Add some useful content to g.space
    for (let el of $svg.find("g.space")) {
        // console.log($(el).prevAll("*[x]"));
        // console.log($(el).prevAll("g"));
        // <text x="887" y="2390" dx="0" dy="0" text-anchor="end" font-size="0px">
        //             <tspan font-family="Garamond" font-size="405px">Altus</tspan>
        //         </text>
    }

    return $svg.get(0);

}
export default extend_vrv;
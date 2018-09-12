/**
 * Copyright © 2015 - 2018 The Broad Institute, Inc. All rights reserved.
 * Licensed under the BSD 3-clause license (https://github.com/broadinstitute/gtex-viz/blob/master/LICENSE.md)
 */

'use strict';
import {createSvg, generateRandomMatrix} from "./modules/utils";
import Heatmap from "./modules/Heatmap";

/*
Heatmap TODO:
1. Rewrite how log transformation is done in the viz code.
2. Change originalValue to displayValue.
3. Rewrite Heatmap constructor param format.
4. Error-checking the DIV ID DOM element.
5. Add tooltip?
6. Color legend?
7. Download button
 */
const demoData = {
    heatmap:generateRandomMatrix({x:50, y:10, scaleFactor:100})
};

/**
 * Renders a 2D Heatmap
 * @param params
 */
export function heatmap(par={
    id: 'gtexVizHeatmap',
    data: demoData.heatmap,
    width: 1200,
    height: 300,
    marginLeft: 20,
    marginRight: 40,
    marginTop: 20,
    marginBottom: 20,
    colorScheme: "YlGnBu",
    cornerRadius: 2,
    columnLabelHeight: 20,
    columnLabelAngle: 60,
    columnLabelPosAdjust: 10,
    rowLabelWidth: 100,
}){
    // create an SVG
    let margin = {
        top: par.marginTop,
        right: par.marginRight,
        bottom: par.marginBottom,
        left: par.marginLeft
    };
    let inWidth = par.width - (par.marginLeft + par.marginRight + par.rowLabelWidth);
    let inHeight = par.height - (par.marginTop + par.marginBottom + par.columnLabelHeight);
    let svg = createSvg(par.id, par.width, par.height, margin);
    let h = new Heatmap(par.data, par.colorScheme, false, null, par.cornerRadius);
    h.draw(svg, {w:inWidth, h:inHeight}, par.columnLabelAngle, false, par.columnLabelPosAdjust);
}


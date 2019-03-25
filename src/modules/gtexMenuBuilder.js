/**
 * Copyright © 2015 - 2018 The Broad Institute, Inc. All rights reserved.
 * Licensed under the BSD 3-clause license (https://github.com/broadinstitute/gtex-viz/blob/master/LICENSE.md)
 */
"use strict";
import jQuery from 'jquery';
import {json} from "d3-fetch";
import {select} from "d3-selection";
import {range} from "d3-array";
import {getGtexUrls, parseTissues} from "./gtexDataParser";

/**
 * Create the tissue (dataset) dropdown menu using select2
 * @param domId {String} the dom ID of the menu
 * @param url {String} the tissue web service url
 * dependency: select2
 */
export function createTissueMenu(domId, url = getGtexUrls().tissue){
    json(url)
        .then(function(results){
            let tissues = parseTissues(results);
            tissues.forEach((d) => {
                d.id = d.tissueSiteDetailId;
                d.text = d.tissueSiteDetail;
            });
            tissues.sort((a, b) => {
                if(a.tissueSiteDetail < b.tissueSiteDetail) return -1;
                if(a.tissueSiteDetail > b.tissueSiteDetail) return 1;
                return 0;
            });

            // external library dependency: select2
            jQuery(`#${domId}`).select2({
                placeholder: 'Select a data set',
                data: tissues
            });

        })
        .catch(function(err){console.error(err)});
}

/**
 * Build the two-level checkbox-style tissue menu
 * dependencies: tissueGroup.css classes
 * @param groups {Dictionary} of lists of tissues indexed by the group name, this is created by gtexDataParser:parseTissueSites()
 * @param domId {String} <div> ID
 * @param forEqtl {Boolean}
 * @param checkAll {Boolean} Whether or not to start all options checked
 * @param sections {Integer} Number of sections to split menu into
 * Dependencies: jQuery, Bootstrap, tissueGroup.css
 * todo: add reset and select all options
 */
export function createTissueGroupMenu(groups, domId, forEqtl=false, checkAll=false, sections=4){
    const mainClass="tissue-group-main-level";
    const subClass = "tissue-group-sub-level";
    const lastSiteClass = "last-site";

    // erase everything in domId in case it isn't empty
    select(`#${domId}`).selectAll("*").remove();

    // add check all and reset options
    const $allTissueDiv = jQuery('<div/>').attr('class', 'col-xs-12 col-md-12').appendTo(jQuery(`#${domId}`));
    if (forEqtl){
        jQuery(`<label class=${mainClass}>` +
        '<input type="radio" name="allTissues" value="reset"> Reset ' +
        '</label><br/>').appendTo($allTissueDiv);
    } else {
        jQuery(`<label class=${mainClass}>` +
        '<input type="radio" name="allTissues" value="all"> All </label> ' +
        `<label class=${mainClass}>` +
        '<input type="radio" name="allTissues" value="reset"> Reset ' +
        '</label><br/>').appendTo($allTissueDiv);
    }


    // check all or reset events
    jQuery('input[name="allTissues"]').change(function(){
        let val = jQuery(this).val();
        switch(val){
            case 'all': {
                jQuery('.tissueGroup').prop('checked', true);
                jQuery('.tissueSubGroup').prop('checked', true);
                break;
            }
            case 'reset': {
                jQuery('.tissueGroup').prop('checked', false);
                jQuery('.tissueSubGroup').prop('checked', false);
                break;
            }
            default:
                // do nothing

        }
    });

    // sort the tissue groups alphabetically
    let groupNames = Object.keys(groups).sort((a, b) => {
        // regular sorting, except that 'Brain' group will always be first
        if (a == 'Brain') return -1;
        else if (b == 'Brain') return 1;
        else if (a < b) return -1;
        else if (a > b) return 1;
    });

    // total number of rows that will be generated
    let rows = Object.keys(groups).reduce((a,b)=>{
        if (groups[b].length>1) return a+1+groups[b].length;
        else return a+groups[b].length;
    }, 0);
    let rowsPerSection = Math.floor(rows/sections);
    let rowsRemain = rows % sections;
    let colSize = Math.floor(12/sections); // for bootstrap grid
    const $sections = range(0, sections).map(d=>{
        return jQuery(`<div id="section${d}" class="col-xs-12 col-md-${colSize}">`).appendTo(jQuery(`#${domId}`));
    });

    let counter = 0;
    let currSection = 0;
    groupNames.forEach((gname)=>{
        let sites = groups[gname]; // a list of site objects with attr: name and id
        const gId = gname.replace(/ /g, "_"); // replace the spaces with dashes to create a group <DOM> id
        // figure out which dom section to append this tissue site
        let groupLen = groups[gname].length;
        groupLen = groupLen == 1 ? groupLen : groupLen+1; // +1 to account for site name
        // move to new section if enough rows are in the current section
        if (counter != 0 && groupLen + counter > rowsPerSection + rowsRemain) {
            counter = 0;
            currSection += 1;
        }
        counter += groupLen;
        let $currentDom = $sections[currSection];

        // create the <label> for the tissue group
        jQuery(`<label class=${mainClass}>`+
            `<input type="checkbox" id="${gId}" class="tissueGroup"> ` +
            `<span>${gname}</span>` +
            '</label><br/>').appendTo($currentDom);

        // tissue sites in the group
        if (sites.length > 1){
             // sort sites alphabetically
            sites.sort((a, b)=>{
                if (a.id > b.id) return 1;
                if (a.id < b.id) return -1;
                return 0;
            })
            .forEach(function(site, i){
                let $siteDom = jQuery(`<label class=${subClass}>`+
                                `<input type="checkbox" id="${site.id}" class="tissueSubGroup"> ` +
                                `<span>${site.name}</span>` +
                                '</label><br/>').appendTo($currentDom);
                if (i == sites.length -1) $siteDom.addClass(lastSiteClass);
                $siteDom.click(function(){
                    jQuery('input[name="allTissues"]').prop('checked', false);
                })
            });
        }

        // custom click event for the top-level tissues: toggle the check boxes
        jQuery("#" + gId).click(function(){
            jQuery('input[name="allTissues"]').prop('checked', false);
            if (jQuery('#' + gId).is(":checked")) {
                // when the group is checked, check all its tissues
                sites.forEach(function (site) {
                    if ("id" == site.id) return;
                    jQuery('#' + site.id).prop('checked', true);
                });
            }
            else {
                // when the group is unchecked, un-check all its tissues
                sites.forEach(function (site) {
                    if ("id" == site.id) return;
                    jQuery('#' + site.id).prop('checked', false);
                });
            }
        });
    });
    if (checkAll) {
        jQuery('input[name="allTissues"][value="all"]').prop('checked', true);
        jQuery('.tissueGroup').prop('checked', true);
        jQuery('.tissueSubGroup').prop('checked', true);
    }
}

/**
 * Parse the two-level checkbox-style tissue menu
 * @param groups {Dictionary} of lists of tissues indexed by the group name, this is created by gtexDataParser:parseTissueSites()
 * @param domId {String} <div> ID
 * @param useNames {Boolean} Whether to return tissue ids or tissue names
 * Dependencies: jQuery
 */
export function parseTissueGroupMenu(groups, domId, useNames=false){
    let queryTissues = [];
    jQuery(`#${domId}`).find(":input").each(function(){ // using jQuery to parse each input item
        if ( jQuery(this).is(":checked")) { // the jQuery way to fetch a checked tissue
            const id = jQuery(this).attr('id');
            if (jQuery(this).hasClass("tissueGroup")){
                // this input item is a tissue group
                // check if this tissue group is a single-site group using the tissueGroups dictionary
                // if so, add the single site to the query list
                let groupName = id.replace(/_/g, " "); // first convert the ID back to group name
                if (groups[groupName].length == 1) {
                    useNames?queryTissues.push(groups[groupName][0].name) : queryTissues.push(groups[groupName][0].id);
                }
            }
            else{ // this input item is a tissue site
                useNames?queryTissues.push(jQuery(jQuery(this).siblings()[0]).text()):queryTissues.push(id);
            }
        }
    });
    return queryTissues.filter((d)=>d!==undefined);
}

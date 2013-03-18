var current_element, changeLog = [[], []], new_element = true;

///////////////////////////////////////////////////////////////////////////////////////////////////////
//		Connection to the servlet																	 //
// 		The directory of the repository (ontologyDir) has been specified 							 //
// 		in the scripts/jowl/jowl_loader.js file														 //
///////////////////////////////////////////////////////////////////////////////////////////////////////

var busy = false;

function sequential(action) {
	if (busy) setTimeout(function(){sequential(action);}, 5);
	else action();
}

function addInstance(type, name)		{sequential(function() {send('method=ADDIN&param=' + ontologyDir + '-' + type + '-' + name);});}
function addObjectProp(inst, prop, val) {sequential(function() {send('method=ADDOP&param=' + ontologyDir + '-' + inst + '-' + prop + '-' + val);});}
function addDataProp(inst, prop, val)	{sequential(function() {send('method=ADDDP&param=' + ontologyDir + '-' + inst + '-' + prop + '-' + val);});}
function remObjectProp(inst, prop) 	    {sequential(function() {send('method=REMOP&param=' + ontologyDir + '-' + inst + '-' + prop);});}
function remDataProp(inst, prop)	    {sequential(function() {send('method=REMDP&param=' + ontologyDir + '-' + inst + '-' + prop);});}
function renameInstance(inst, name)		{sequential(function() {send('method=RENIN&param=' + ontologyDir + '-' + inst + '-' + name);});}

function send(message){
	busy = true;
	var request = new XMLHttpRequest();
	request.open("POST", "owlapi", true);
	request.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
	request.send(message);
	request.onreadystatechange = function() {busy = false;};
}

/////////////////////////////////////////////////////////////////////////////
//		Initalization of the editing									   //
/////////////////////////////////////////////////////////////////////////////
function addOptions (options, dest) {
	cleanOptions(dest);
	options.forEach(function(option_val, id){
		var option = document.createElement("OPTION");
		option.text = option.value = option_val;
		dest.options.add(option);
	});
}

function cleanOptions (src) {src.options.length = 0;}
function cleanInput (src) {src.value = "";}
function cleanCheckbox (src) {src.checked = false;}
function cleanSelect (src) {if (src.options.selectedIndex >=0) src.options[src.options.selectedIndex].selected = false;}
function cleanSelects (src) {for (var i=0; i<src.options.length; i++) src.options[i].selected = false;}
	
function reloadEdit(){
	var feature_form = document.edit_feature_form,
		perspective_form = document.edit_perspective_form,
		productline_form = document.edit_productline_form,
		stakeholder_form = document.edit_stakeholder_form,
		type_selection = feature_form.feature_type,
		perspective_selection = feature_form.feature_perspective,
		perspective_selection2 = productline_form.productline_hasperspective,
		productline_selection = feature_form.feature_productline,
		keyword_selection1 = feature_form.feature_keywords_list,
		keyword_selection2 = perspective_form.perspective_keywords_list,
		keyword_selection3 = productline_form.productline_keywords_list,
		keyword_selected1 = feature_form.feature_keywords_selected,
		keyword_selected2 = perspective_form.perspective_keywords_selected,
		keyword_selected3 = productline_form.productline_keywords_selected,
		owner_selection = feature_form.feature_owner,
		stakeholder_selection = feature_form.feature_stakeholder,
		optionally_selection = feature_form.opt_composition,
		optionally_selected = feature_form.opt_comp_selected,
		mandatory_selection = feature_form.mand_composition,
		mandatory_selected = feature_form.mand_comp_selected,
		option_selection = feature_form.options,
		option_selected = feature_form.options_selected;
	
	cleanInput(perspective_form.perspective_name);
	cleanInput(perspective_form.perspective_description);
	cleanInput(productline_form.productline_name);
	cleanInput(productline_form.productline_description);
	cleanSelect(productline_form.productline_hasperspective);
	cleanInput(stakeholder_form.stakeholder_name);
	cleanInput(stakeholder_form.stakeholder_description);
	cleanInput(feature_form.feature_name);
	cleanInput(feature_form.feature_description);
	cleanInput(feature_form.new_keyword);
	cleanCheckbox(feature_form.feature_standalone);
	cleanSelect(productline_selection);
	cleanSelect(type_selection);
	cleanSelect(owner_selection);
	cleanSelect(stakeholder_selection);
	cleanSelects(perspective_selection);
	cleanOptions(keyword_selected1);
	cleanOptions(keyword_selected2);
	cleanOptions(keyword_selected3);
	cleanOptions(mandatory_selected);
	cleanOptions(optionally_selected);
	cleanOptions(option_selected);
	addOptions(["--", "Abstract_Feature", "Concrete_Feature"], type_selection);
	addOptions(["--"].concat(perspectives), perspective_selection);
	addOptions(["--"].concat(productlines), productline_selection);
	addOptions(["--"].concat(owners), owner_selection);
	addOptions(["--"].concat(stakeholders), stakeholder_selection);
	addOptions(keywords, keyword_selection1);
	addOptions(keywords, keyword_selection2);
	addOptions(keywords, keyword_selection3);
	addOptions(features, optionally_selection);
	addOptions(features, mandatory_selection);
	addOptions(features, option_selection);	//TEMP!
	addOptions(perspectives, perspective_selection2);
}

function editElement(id){
	var type = repository[id].type;
	
	$("#edit_button").click();
	current_element = id;
	$("#add_feature").attr('class', 'edit_menu_bar');
	
	new_element = false;
	switch (type) {
		case 'Feature':
		case 'Abstract_Feature':
		case 'Concrete_Feature':editFeature(); break;
		case 'Productline':editProductline(); break;
		case 'Business_Analyst':
		case 'Client':
		case 'Developer':
		case 'Domain_Expert':
		case 'Marketing':
		case 'Modeller':
		case 'Project_Manager':
		case 'Sales':
		case 'Testers':
		case 'Stakeholder': editStakeholder(); break;
		case 'Product_Line': editProductline(); break;
	}
}


/////////////////////////////////////////////////////////////////////////////
//		Functions to load properties of element						   //
/////////////////////////////////////////////////////////////////////////////
function filterProperties(element){
	var keys = [];
	for (var key in element)
  		if (key[0] != "_") keys.push(key);
  	return keys;
}

function selectItem(element, src, dst) {
	if (typeof element == "number") element = repository[element].name;
	for(var i=0; i< src.options.length; i++) {
		var option = src.options[i];
		if (option.value == element)
			if (dst) {
				src.options.remove(i);
				dst.options.add(option);
			} else 
				option.selected=true;
	}
}

function loadFeatureProperties() {
	var element = repository[current_element],
		element_properties  = filterProperties(element),
		type_selection = document.edit_feature_form.feature_type,
		perspective_selection = document.edit_feature_form.feature_perspective,
		productline_selection = document.edit_feature_form.feature_productline,
		keyword_selection = document.edit_feature_form.feature_keywords_list,
		keyword_selected = document.edit_feature_form.feature_keywords_selected,
		owner_selection = document.edit_feature_form.feature_owner,
		stakeholder_selection = document.edit_feature_form.feature_stakeholder,
		optionally_selection = document.edit_feature_form.opt_composition,
		optionally_selected = document.edit_feature_form.opt_comp_selected,
		mandatory_selection = document.edit_feature_form.mand_composition,
		mandatory_selected = document.edit_feature_form.mand_comp_selected,
		option_selection = document.edit_feature_form.options,
		option_selected = document.edit_feature_form.options_selected;
		
	element_properties.forEach(function(property, id){
		switch (property) {
			case "name": document.edit_feature_form.feature_name.value = element[property]; break;
			case "type": selectItem(element[property], type_selection); displaydetails(); break;
			case "Belongs_to": element[property].forEach(function (value, id) {selectItem(value, perspective_selection);}); break;
			case "Has_Option": element[property].forEach(function (value, id) {selectItem(value, option_selection, option_selected);}); break;
			case "Mandatory_Composition": element[property].forEach(function (value, id) {selectItem(value, mandatory_selection, mandatory_selected);}); break;
			case "Optional_Composition": element[property].forEach(function (value, id) {selectItem(value, optionally_selection, optionally_selected);}); break;
			case "Standalone": document.edit_feature_form.feature_standalone.checked = true; break;
			case "has_Description": document.edit_feature_form.feature_description.value = element[property]; break;
			case "has_Keyword":element[property].forEach(function (value, id) {selectItem(value, keyword_selection, keyword_selected);}); break;
			case "has_Owner": element[property].forEach(function (value, id) {selectItem(value, owner_selection);}); selectStakeholder(); break;
			case "has_Stakeholder": element[property].forEach(function (value, id) {selectItem(value, stakeholder_selection);}); break;
			case "Used_in": selectItem(element[property], productline_selection); break;
			case "Excludes": break;
			case "Extends": break;
 			case "Requires": break;
			case "has_Label": break;
		}
	});
}

function loadProperties(dct1, dct2, dct3) {
	var element = repository[current_element],
		element_properties = filterProperties(element);
	
	element_properties.forEach(function(property, id){
		switch(property){
			case "name": dct1.value = element[property]; break;
			case "has_Description": dct2.value = element[property]; break;
			case "has_Perspective": selectItem(element[property], dct3); break;
		}
	});
}

function loadPerspectiveProperties() {
	loadProperties(document.edit_perspective_form.perspective_name, 
				   document.edit_perspective_form.perspective_description);
}

function loadProductlineProperties() {
	loadProperties(document.edit_productline_form.productline_name, 
				   document.edit_productline_form.productline_description, 
				   document.edit_productline_form.productline_hasperspective);
}

function loadStakeholderProperties() {
	loadProperties(document.edit_stakeholder.stakeholder_name, 
				   document.edit_stakeholder.stakeholder_description);
}


/////////////////////////////////////////////////////////////////////////////
//		Functions to change properties of element						   //
/////////////////////////////////////////////////////////////////////////////
function displaydetails () {
	 if (document.edit_feature_form.feature_type.options[document.edit_feature_form.feature_type.selectedIndex].value=="Concrete_Feature") {
			document.getElementById('mandatory_composition_selection').style.display='table-row';
			document.getElementById('optional_composition_selection').style.display='table-row';
			document.getElementById('option_selection').style.display='none';
	 } else if (document.edit_feature_form.feature_type.options[document.edit_feature_form.feature_type.selectedIndex].value=="Abstract_Feature") {
	        document.getElementById('option_selection').style.display='table-row';
	        document.getElementById('mandatory_composition_selection').style.display='none';
	        document.getElementById('optional_composition_selection').style.display='none';
	 }  
}

function check(value, checklist){
	for(var i=0; i<checklist.options.length; i++) {
		if (value == checklist.options[i].value) {
			document.getElementById('errormsg').innerHTML = 'A feature can not be selected optional and mandatory at the same time.';
			return false;
		}
	}
	return true;
}

function moveitems(src, dest, checklist) { 
  for (var i=0; i<src.options.length; i++) {
    if (src.options[i].selected) {
    	if (!checklist || check(src.options[i].value, checklist)) {
	    	var sel_option=document.createElement("option");
		    sel_option.value= src.options[i].value;
		    sel_option.text= src.options[i].text;
		    dest.options.add(sel_option,0);
		    src.options.remove(i);
		    i--;
    		}
	    }
	}
}

function add_new_keyword(keyword_txt, dest) {
	var sel_option=document.createElement("option");
	sel_option.value = keyword_txt;
  	sel_option.text = keyword_txt;
	dest.options.add(sel_option,0);
}

function selectStakeholder() {
	var selected_owner = document.edit_feature_form.feature_owner.options[document.edit_feature_form.feature_owner.selectedIndex].value,
		stakeholders = document.edit_feature_form.feature_stakeholder;
	for (var i=0; i<stakeholders.options.length; i++)
		if (stakeholders.options[i].value == selected_owner)
			stakeholders.options[i].selected=true;
		else
			stakeholders.options[i].selected=false;
}

function validateforSubmit(type) {
	function hasValue(src) {
		var element = document.getElementById(src);
		if (element.nodeName == "SELECT")
			return element.selectedIndex > 0;
		else if (element.nodeName == "INPUT" || element.nodeName == "TEXTAREA")
			if (element.type == "checkbox")
				return element.checked;
			else
				return element.value != "";
	}
	
	function getValues(src, forced) {
		var element = document.getElementById(src), result = [];
		switch(element.type) {
			case "select-one": result = element.options[element.options.selectedIndex].value; break;
			case "select-multiple": for (var i=0; i<element.options.length; i++)
										if (element.options[i].selected || forced)
											result.push(element.options[i].value); break;
			case "text":
			case "textarea": result = element.value; break;
		}
		return result;
	}
	
	function addUnique(dest, value, forced) {
		if (forced)
			for(var i=0; i<=dest.length && dest[i]!=value; i++)
				if (i == dest.length) {
					dest.push(value);
					return;
				}
		else dest = [value];
	}
	
	function addValue(name, dest, values) {
		if (typeof values != "object") values = [values];
		values.forEach(function(value, id){
			switch (dest) {
				case "name":				 if (new_element) addInstance("Feature", name);
											 else if (repository[current_element]["name"] != name) 
											 	renameInstance(repository[current_element]["name"], name); break;
				case "Used_in":  			 if (id == 0) remObjectProp(name, "Used_in");
										 	 addObjectProp(name, "Used_in", value); break;
				case "Belongs_to":  		 addObjectProp(name, "Belongs_to", value); break;
				case "has_Description":  	 if (id == 0) remDataProp(name, "has_Description");
											 addDataProp(name, "has_Description", value); break;
				case "has_Keyword": 		 addObjectProp(name, "has_Keyword", value); break;
				case "type": 		 		 addInstance(value, name); break;
				case "Standalone": 	 		 if (id == 0) remDataProp(name, "Standalone");
											 addDataProp(name, "Standalone", value); break;
				case "Mandatory_Composition":if (id == 0) remObjectProp(name, "Mandatory_Composition");
											 addObjectProp(name, "Mandatory_Composition", value); 
											 addObjectProp(name, "Composition", value); break;
				case "Optional_Composition": if (id == 0) remObjectProp(name, "Mandatory_Composition");
											 addObjectProp(name, "Optional_Composition", value); 
											 addObjectProp(name, "Composition", value); break;
				case "Has_Option": 			 if (id == 0) remObjectProp(name, "Has_Option");
											 addObjectProp(name, "Has_Option", value); 
											 addObjectProp(value, "Option_of", name); break;
				case "has_Owner": 		 	 if (id == 0) remObjectProp(name, "has_Owner");
											 addObjectProp(name, "has_Owner", value); break;
				case "has_Stakeholder":  	 if (id == 0) remObjectProp(name, "has_Stakeholder");
											 addObjectProp(name, "has_Stakeholder", value); break;
			};
		});
	}
	
	function validateFeature() {
		/*if(dictionarySearch(dictionary, document.edit_feature_form.feature_name.value, true)){
		 	document.getElementById('errormsg').innerHTML = 'This feature already exists';
		 	return false;
		} else if (document.edit_feature_form.feature_productline.options[document.edit_feature_form.feature_productline.selectedIndex].value < 1) {
	  		document.getElementById('errormsg').innerHTML = 'Please select a Product Line for your features';
			return false;
		} else if (document.edit_feature_form.feature_perspective.options[document.edit_feature_form.feature_perspective.selectedIndex].value < 1) {
	  		document.getElementById('errormsg').innerHTML = 'Please select a Perspective for your features';
			return false;
		} else 
		if (document.edit_feature_form.feature_name.value.length <3) {
	  		document.getElementById('errormsg').innerHTML = 'Please enter a valid Feature name ';
	 		return false;
		} else if (document.edit_feature_form.feature_description.value.length<10) {
	 		document.getElementById('errormsg').innerHTML = 'Please enter a valid Feature description ';
	 		return false;
		} else if (document.edit_feature_form.feature_type.selectedIndex < 1) { 
			document.getElementById('errormsg').innerHTML = 'Please select a Feature type ';
			return false;}*/
	    var name = getValues("feature_name");
		if (hasValue("feature_name")) addValue(name, "name");
		if (hasValue("feature_productline")) addValue(name, "Used_in", getValues("feature_productline"));
		if (hasValue("feature_perspective")) addValue(name, "Belongs_to", getValues("feature_perspective"));
		if (hasValue("feature_description")) addValue(name, "has_Description", [getValues("feature_description")]);
		addValue(name, "has_Keyword", getValues("feature_keywords_selected", true));
		if (hasValue("feature_type")) addValue(name, "type", getValues("feature_type"));
		if (hasValue("feature_standalone")) addValue(name, "Standalone", ["true"]);
		addValue(name, "Mandatory_Composition", getValues("mand_comp_selected", true));
		addValue(name, "Optional_Composition", getValues("opt_comp_selected", true));
		addValue(name, "Has_Option", getValues("options_selected", true));
		if (hasValue("feature_owner")) addValue(name, "has_Owner", [getValues("feature_owner")]);
		if (hasValue("feature_stakeholder")) addValue(name, "has_Stakeholder", getValues("feature_stakeholder"));
		
		document.getElementById('errormsg').innerHTML = '<FONT COLOR="blue"> saving... </FONT>';
		sequential(load);
		document.getElementById('errormsg').innerHTML = '<FONT COLOR="blue"> Feature saved </FONT>';
		return true;
	}
	

	function validatePerspective() {
		if(perspectives.indexOf(document.edit_feature_form.perspective_name.value) > -1){
		 	document.getElementById('errormsg').innerHTML = 'This perspective already exists';
		 	return false;
		} else if (document.edit_perspective_form.perspective_name.value.length <3) {
	  		document.getElementById('errormsg').innerHTML = 'Please enter a valid perspective name ';
	 		return false;
		} else if (document.edit_perspective_form.perspective_description.value.length<10) {
	 		document.getElementById('errormsg').innerHTML = 'Please enter a valid perspective description ';
	 		return false;}
	 		
		var name = getValues("perspective_name");
		addValue(name, "name");
		addValue(name, "has_Description", getValues("perspective_description"));
		addValue(name, "has_Perspective_Keyword", getValues("perspective_keywords_selected", true));
		
		document.getElementById('errormsg').innerHTML = '<FONT COLOR="blue"> saving... </FONT>';	
		sequential(load);
		document.getElementById('errormsg').innerHTML = '<FONT COLOR="blue"> Perspective saved </FONT>';
		return true;
	}

	function validateProductline() {
		if(productlines.indexOf(document.edit_feature_form.productline_name.value) > -1){
		 	document.getElementById('errormsg').innerHTML = 'This productline already exists';
		 	return false;
		} else if (document.edit_productline_form.productline_name.value.length <3) {
	  		document.getElementById('errormsg').innerHTML = 'Please enter a valid productline name ';
	 		return false;
		} else if (document.edit_productline_form.productline_description.value.length<10) {
	 		document.getElementById('errormsg').innerHTML = 'Please enter a valid productline description ';
	 		return false;}
		
		var name = getValues("productline_name");
		addValue(name, "name");
		addValue(name, "has_Description", getValues("productline_description"));
		if (hasValue("productline_hasperspective")) addValue(name, "has_Perspective", getValues("productline_hasperspective"));
		addValue(name, "has_PL_Keyword", getValues("productline_keywords_selected", true));

		document.getElementById('errormsg').innerHTML = '<FONT COLOR="blue"> saving... </FONT>';
		sequential(load);
		document.getElementById('errormsg').innerHTML = '<FONT COLOR="blue"> Productline saved </FONT>';
		return true;
	}
	
	function validateStakeholder() {
		if(stakeholders.indexOf(document.edit_feature_form.stakeholder_name.value) > -1){
		 	document.getElementById('errormsg').innerHTML = 'This stakeholder already exists';
		 	return false;
		} else if (document.edit_stakeholder_form.stakeholder_name.value.length <3) {
	  		document.getElementById('errormsg').innerHTML = 'Please enter a valid Stakeholder name ';
	 		return false;
		} else if (document.edit_stakeholder_form.stakeholder_description.value.length<10) {
	 		document.getElementById('errormsg').innerHTML = 'Please enter a valid Stakeholder description ';
	 		return false;}
	 	
	 	var name = getValues("stakeholder_name");
		addValue(name, "name");
		addValue(name, "has_Description", getValues("stakeholder_description"));
			
		document.getElementById('errormsg').innerHTML = '<FONT COLOR="blue"> saving... </FONT>';
		sequential(load);
		document.getElementById('errormsg').innerHTML = '<FONT COLOR="blue"> Stakeholder saved </FONT>';
		return true;
	}
	
	switch (type) {
		case "feature": validateFeature(); break;
		case "perspective": validatePerspective(); break;
		case "productline": validateProductline(); break;
		case "stakeholder": validateStakeholder(); break;
	}
	new_element = true;
}

function editFeature() {
	$("#edit_perspective").hide();
	$("#edit_productline").hide();
	$("#edit_stakeholder").hide();
	$("#edit_feature").show();
	loadFeatureProperties();
}

function editPerspective() {
	$("#edit_productline").hide();
	$("#edit_stakeholder").hide();
	$("#edit_feature").hide();
	$("#edit_perspective").show();
	loadPerspectiveProperties();
}

function editProductline() {
	$("#edit_perspective").hide();
	$("#edit_stakeholder").hide();
	$("#edit_feature").hide();
	$("#edit_productline").show();
	loadProductlineProperties();
}

function editStakeholder() {
	$("#edit_perspective").hide();
	$("#edit_productline").hide();
	$("#edit_feature").hide();
	$("#edit_stakeholder").show();
	loadStakeholderProperties();
}

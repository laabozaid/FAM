var	pageCtr,
	resultCtr,
	currentPage,
	itemsPerPage = 5;

var searchengine = function() {
	var name, searchfield, perspective_list, type_list, relation_list, owner_list, 
		stakeholder_list, type, relation, owner, stakeholder, option_feature,
		standalone, keyword, query, single, query_result;
  	
  	function filter(source, val) {
  		var filter_result = [];
  		for (var i=0; i<source.length; i++) {
  			source_name = source[i].name.toLowerCase();
  			val = val.toLowerCase();
  			if (source_name.indexOf(val) > -1) {
  				filter_result.push(source[i]);
  			}
  		}
  		query_result = filter_result;
  	}
	
	function initSearchArea() {
		pageCtr = 0;
		resultCtr = 0;
		currentPage = 0;
		searchengine.updateNavigation();
		$("#result_area").empty();
	}
	
	function updateResultInfo() {
		var result_indicator = document.getElementById('result_ctr');	
		result_indicator.innerHTML = resultCtr + " item(s) were found";
  	}
	
	function retrieveData(source) {
		for (var i=0; i<source.length; i++) {
			var result = dictionarySearch(dictionary, source[i].name, true);
			resultCtr += 1;
			currentPage = 1;
			addResult(repository[result.index], resultCtr);
		}
		updateResultInfo();
	}
	
	function addResult(result, resultCtr) {
		function makeItem() {
			var perspectives ='<br />', mandatory_children = "", optional_children = "", option_of = "";
			for (var i=0; (getPerspectives(result) && i<getPerspectives(result).length); i++) 
				{perspectives += '- ' + getPerspectives(result)[i] + '<br />';}
			if (result._option) option_of = 'Option of: ' + repository[result._parent_id].name;
			if (result.type != 'Abstract_Feature') 
			{
				mandatory_children = 'Mandatory Children: ' + getMandatoryChildren(result).length;
				optional_children = 'Optional Children: ' + getOptionalChildren(result).length;
			}
				
			var new_item = document.createElement('div'), destiny = document.getElementById('result_page' + pageCtr.toString());
			new_item.setAttribute('class', 'search_result');
  			new_item.innerHTML = 
  			'<table border="0" width="100%" height="65">' +
  				'<tr> <td width="20">' + '<input type="button" value="Details" style="width:50px" onClick="infoNode(' + result._id + ', ' + result.parent + ')" />' + '</td>' +
  					 '<td width="35%">' + '<b>' + result.name + '</b>' + '</td>' +
  				 	 '<td width="15%">' + 'Options: ' + getOptions(result).length + '</td>' +
  					 '<td width="30%" rowspan=3 vAlign="top">' + 'Perspectives: ' + perspectives + '</td>' + 
  				'</tr>' +
  				'<tr> <td width="20">' + '<input type="button" value="Display" style="width:50px" onClick="gotoNode(' + result._id + ', ' + result.parent + ')" />' + '</td>' + 
  					 '<td width="35%">' + 'Type: ' + result.type + '</td>' + 
  					 '<td width="15%">' + mandatory_children + '</td>' +
  					 '<td width="30%">' + '</td>' + 
  				'</tr>' +
  				'<tr> <td width="20">' + '<input type="button" value="Edit" style="width:50px" onClick="editElement(' + result._id + ')" />' + '</td>' + 
  					 '<td width="35%">' + option_of + '</td>' + 
  					 '<td width="15%">' + optional_children + '</td>' + 
  					 '<td width="30%">' + '</td>' + 
  				'</tr>' +
  			'</table>';
  			destiny.appendChild(new_item);
		}
		
  		function makePage(){
  			var result_area = document.getElementById('result_area'),
  				new_page = document.createElement('div');
  			pageCtr += 1;
  			if (pageCtr != 1) new_page.style.display = 'none';
  			new_page.setAttribute('class', 'result_area');
  			new_page.setAttribute('id', ('result_page' + pageCtr.toString()));
  			result_area.appendChild(new_page);
  		}
  		
  		if (((resultCtr-1) % itemsPerPage) == 0) makePage();
  		makeItem();
  		searchengine.updateNavigation();	
	}

	function searchFP(form) {
		name 			 = form.search_name.value,
		searchfield 	 = document.getElementById("searchfield"),
		perspective_list = searchfield.search_perspective,
		type_list 		 = searchfield.search_type,
		relation_list 	 =	searchfield.search_relation,
		owner_list 		 = searchfield.search_owner,
		stakeholder_list = searchfield.search_stakeholder,
  		type 			 = type_list[type_list.selectedIndex].text,
  		relation 		 = relation_list[relation_list.selectedIndex].text,
  		owner 			 = owner_list[owner_list.selectedIndex].text,
  		stakeholder 	 = stakeholder_list[stakeholder_list.selectedIndex].text,
  		option_feature 	 = form.search_option.checked,
  		standalone 		 = form.search_standalone.checked,
  		keyword 		 = form.search_keyword.value,
  		query 			 = "",
  		single 			 = true;
  		
		for (var i=0; i<perspective_list.length; i++)
			if (perspective_list[i].selected && perspective_list[i].text != "--")
								 query += "PropertyValue(?thing, " + file_adress + "Belongs_to, " + file_adress + perspective_list[i].text +"), " + "Type(?thing, " + file_adress + "Feature), ";
		if (type != "--")    	 query += "Type(?thing, " + file_adress + type + "), ";
		if (option_feature)     {query += "PropertyValue(?feature, " + file_adress + "Has_Option, ?thing), " + "Type(?feature, " + file_adress + "Feature), "; single = false;}
		if (standalone)          query += "PropertyValue(?thing, " + file_adress + "Standalone, \"true\"), " + "Type(?thing, " + file_adress + "Feature), ";
		if (relation != "--")	{query += "Type(?thing, " + file_adress + "Feature), PropertyValue(?thing, " + file_adress + relation + ", ?value), "; single = false;}
		if (owner != "--")		 query += "PropertyValue(?thing, " + file_adress + "has_Owner, " + file_adress + owner +"), Type(?thing, " + file_adress + "Feature), ";
		if (stakeholder != "--") query += "PropertyValue(?thing, " + file_adress + "has_Stakeholder, " + file_adress + stakeholder +"), Type(?thing, " + file_adress + "Feature), ";
		if (keyword != "--")		 query += "PropertyValue(?thing, " + file_adress + "has_Keyword, " + file_adress + keyword +"), Type(?thing, " + file_adress + "Feature), ";
		
		if (query.length > 0) {
			query = query.substring(0,(query.length-2));
			query_result = jOWL_loader.search(query, !single);
			if (!single) 
				query_result.forEach(function(result, i){query_result[i] = result["?thing"];});
		} else {
			query_result = jOWL_loader.search("Type(?x, " + file_adress + "Feature)", !single);}
		
		if (name != "") filter(query_result, name);
		initSearchArea();
		retrieveData(query_result);
	}
	
	function highlightButton(button) {
		document.getElementById(button).style.fontWeight='bold';
	}
	
	function unhighlightButton(button) {
		document.getElementById(button).style.fontWeight='normal';
	}
	
	function updateNav() {
		if (currentPage <= 1) {
				if (pageCtr > 1) 
				   searchengine.highlight('next_page');
				else 
				   searchengine.unhighlight('next_page');
				searchengine.unhighlight('prev_page');
			} else {
				searchengine.highlight('prev_page');
	 			if (currentPage == pageCtr) 
	 				searchengine.unhighlight('next_page');
	 			else 
	 				searchengine.highlight('next_page');
	 		}
			document.getElementById('page_ctr').innerHTML = "Page " + currentPage.toString() + " of " + pageCtr.toString();
	}
	
	function previous() {
		if (currentPage > 1) {
				var old_page = document.getElementById('result_page' + currentPage.toString()),
					new_page = document.getElementById('result_page' + (currentPage-1).toString());
				currentPage -= 1;
				old_page.style.display = 'none';
				new_page.style.display = 'block';
				searchengine.updateNavigation();
			}
	}
	
	function next() {
		if (currentPage != pageCtr) {
				var old_page = document.getElementById('result_page' + currentPage.toString()),
					new_page = document.getElementById('result_page' + (currentPage+1).toString());
				currentPage += 1;
				old_page.style.display = 'none';
				new_page.style.display = 'block';
				searchengine.updateNavigation();
			}
	}
	
	return {
		search: 		  function(form){searchFP(form);},
		highlight: 		  function(button){highlightButton(button);},
		unhighlight: 	  function(button) {unhighlightButton(button);},
		updateNavigation: function() {updateNav();}, 
		previousPage: 	  function() {previous();},
		nextPage: 		  function() {next();}
	};
}();





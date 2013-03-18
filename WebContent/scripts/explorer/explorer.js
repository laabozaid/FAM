function load(){
	function wait() {
		if (!jOWL_loader.ready())
			setTimeout(function(){wait();}, 2);
		else {
			addPerspectives();
			addSelection(properties, "relations");
			addSelection(owners, "owners");
			addSelection(stakeholders, "stakeholders");
			addSelection(keywords, "keywords");
			addViews();
			explore();
		}
	}
	jOWL_loader.load();	
	wait();
}

function initApplet(){
	var attributes = { id:'sender', code:'sesame/InJava.class', archive:'owlapi/servlet.jar', width:300, height:50} ;
    var parameters = {} ;
    deployJava.runApplet(attributes, parameters, '1.6');
}

function addPerspectives() {
	var first = true, 
		perspectives_list = document.getElementById("searchfield").search_perspective;
		
	
	perspectives.forEach(function(perspective, id) {
		var form = document.getElementById("perspectives"), checked = "";
		if (first) 
		{
			var option = document.createElement("OPTION");
			option.text = option.value = "--";
			perspectives_list.options.add(option);
			checked = "CHECKED";
		}
    	form.innerHTML += "<input type='checkbox' name='options' id='" + perspective + "' onClick='updatePerspectives()' " + 
    					  checked + "/>" + perspective + "<br />";
    	var option = document.createElement("OPTION");
		option.text = option.value = perspective;
		perspectives_list.options.add(option);
    	first = false;
	});
}

function addViews(){
	var added_general= false,
	    added_relational= false;
	property_list.forEach(function(view, id){
		var	form, checked = "";
		if (property_view[id]) checked = "CHECKED";
		if ((view == 'Mandatory_Composition' ||
			 view == 'Optional_Composition' ||
			 view.toLowerCase().search('has') > -1) && !added_general)
		form = document.getElementById("general_views")
		else
		form = document.getElementById("relational_views")
		form.innerHTML += "<input type='checkbox' name='views' id='" + view + "' onClick='updateViews()' " +
						  checked + "/> Show " + view + "<br />";
	})
}

function addSelection(all_options, key) {
	var selection_list;
	switch (key) {
	case 'stakeholders':
		selection_list = document.getElementById("searchfield").search_stakeholder;
		break;
	case 'owners':
		selection_list = document.getElementById("searchfield").search_owner;
		break;
	case 'relations':
		selection_list = document.getElementById("searchfield").search_relation;
		break;
	case 'keywords':
		selection_list = document.getElementById("searchfield").search_keyword;
	}
	for (var i=0; i<all_options.length+1; i++){
		var option = document.createElement("OPTION");
		if (i==0) option.text = option.value = "--";
		else option.text = option.value = all_options[i-1];
		selection_list.options.add(option);
	}
}

function showDetails(properties, navigate) {
	function displayChildren(list){
		var result = "";
		list.forEach(function (name, id){
			result += "<br />" + "&nbsp &nbsp -" + name;
		});
		return result + "<br />";
	};
	
	var property_names = properties[0],
		property_values = properties[1],
		contents = "<h2>Details</h2> <dl>";
	for (var i=0; i<property_names.length; i++) {
		for (var j=0; j<property_names[i].length; j++) {
			var property_value = property_values[i][j],
				property_name = property_names[i][j];
			if (typeof(property_value) == "object") 
				property_value = displayChildren(property_value);
			if (property_name == "Parent")
				if (navigate) 
					contents += "<b>" + property_name + ": </b>" + '<u style="cursor:pointer" onClick=infoNode(' + property_value + ') cursor=pointer>' + repository[property_value].name + "</u>" + "<br />";
				else contents += "<b>" + property_name + ": </b>" + repository[property_value].name + "<br />";
			else contents += "<b>" + property_name + ": </b>" + property_value + "<br />";
			}
		if (i == 0) contents += "<br />" + "---------Relations---------------------------" + "<br />"
		else if (i == 1) contents += "<br />" + "---------Feature-Dependencies-----------" + "<br />"
	}
	contents += "</dl>";
	return contents;
}

function updateDetailpanel(properties){
	var panel = document.getElementById("detail_panel");
	panel.innerHTML = showDetails(properties, false);
}

function drawText(canvas, text){
	var ctx = canvas.getContext('2d'),
		width;

	ctx.fillStyle = "#fff";
    ctx.font = '700 12pt verdana';
    
    width = ctx.measureText(text).width + 5;
    if (width < 100) {width += 15}
    ctx.translate(25, width);
    ctx.rotate(Math.PI*1.5);
    
    ctx.fillText(text, 0, 0);
}
     
//function getData(data) {
//	trace("check");
//	receiver.incrementCounter();
//}

$(document).ready(function () {
	
	document.getElementById("explore_area").style.height = window.innerHeight - 150;
	document.getElementById("explore_area").style.width = window.innerWidth;
	
	$("#explore_button").click(function() {
		$("#search_area").hide();
		$("#edit_area").hide();
		$("#preferences_area").hide();
		$("#explore_area").show();
		$("#explore_button").attr('class', 'menu_bar_selected');
		$("#search_button").attr('class', 'menu_bar');
		$("#edit_button").attr('class', 'menu_bar');
		$("#preferences_button").attr('class', 'menu_bar');
		$("#assemble_button").attr('class', 'menu_bar');
		$("#assemble_area").hide();
		
		explore();
	})
	
	$("#search_button").click(function() {
		$("#explore_area").hide();
		$("#edit_area").hide();
		$("#preferences_area").hide();
		$("#search_area").show();
		$("#explore_button").attr('class', 'menu_bar');
		$("#search_button").attr('class', 'menu_bar_selected');
		$("#edit_button").attr('class', 'menu_bar');
		$("#preferences_button").attr('class', 'menu_bar');
		$("#assemble_button").attr('class', 'menu_bar');
		$("#assemble_area").hide();
	})
	
	$("#edit_button").click(function() {
		$("#explore_area").hide();
		$("#search_area").hide();
		$("#preferences_area").hide();
		$("#edit_area").show();
		$("#explore_button").attr('class', 'menu_bar');
		$("#search_button").attr('class', 'menu_bar');
		$("#edit_button").attr('class', 'menu_bar_selected');
		$("#preferences_button").attr('class', 'menu_bar');
		$("#assemble_button").attr('class', 'menu_bar');
		$("#assemble_area").hide();
		$("#add_feature").click();
		current_element = repository.length;
		reloadEdit();
	
	})
	
	$("#add_feature").click(function() {
		$("#edit_perspective").hide();
		$("#edit_productline").hide();
		$("#edit_stakeholder").hide();
		$("#edit_feature").show();
		$("#add_perspective").attr('class', 'edit_menu_bar');
		$("#add_productline").attr('class', 'edit_menu_bar');
		$("#add_stakeholder").attr('class', 'edit_menu_bar');
		$("#add_feature").attr('class', 'edit_menu_bar_selected');
		$("#assemble_area").hide();
		current_element = repository.length;
		new_element = true;
		reloadEdit();
	})
	
	$("#add_perspective").click(function() {
		$("#edit_feature").hide();
		$("#edit_productline").hide();
		$("#edit_stakeholder").hide();
		$("#edit_perspective").show();
		$("#add_feature").attr('class', 'edit_menu_bar');
		$("#add_productline").attr('class', 'edit_menu_bar');
		$("#add_stakeholder").attr('class', 'edit_menu_bar');
		$("#add_perspective").attr('class', 'edit_menu_bar_selected');
		$("#assemble_area").hide();
		current_element = repository.length;
		new_element = true;
		reloadEdit();
	})
	
	$("#add_productline").click(function() {
		$("#edit_feature").hide();
		$("#edit_perspective").hide();
		$("#edit_stakeholder").hide();
		$("#edit_productline").show();
		$("#add_feature").attr('class', 'edit_menu_bar');
		$("#add_perspective").attr('class', 'edit_menu_bar');
		$("#add_stakeholder").attr('class', 'edit_menu_bar');
		$("#add_productline").attr('class', 'edit_menu_bar_selected');
		$("#assemble_area").hide();
		current_element = repository.length;
		new_element = true;
		reloadEdit();
	})
	
	$("#add_stakeholder").click(function() {
		$("#edit_feature").hide();
		$("#edit_perspective").hide();
		$("#edit_productline").hide();
		$("#edit_stakeholder").show();
		$("#add_feature").attr('class', 'edit_menu_bar');
		$("#add_perspective").attr('class', 'edit_menu_bar');
		$("#add_productline").attr('class', 'edit_menu_bar');
		$("#add_stakeholder").attr('class', 'edit_menu_bar_selected');
		$("#assemble_area").hide();
		current_element = repository.length;
		new_element = true;
		reloadEdit();
	})
	
	$("#home").click(function(){
    	explore();
    	return false;
    });
	
	$("#zoom_in").click(function(){
    	zoom("in");
    	return false;
    });
    
    $("#zoom_out").click(function(){
    	zoom("out");
    	return false;
    });
	
	$("#preferences_button").click(function() {
		$("#explore_area").hide();
		$("#search_area").hide();
		$("#edit_area").hide();
		$("#preferences_area").show();
		$("#explore_button").attr('class', 'menu_bar');
		$("#search_button").attr('class', 'menu_bar');
		$("#edit_button").attr('class', 'menu_bar');
		$("#preferences_button").attr('class', 'menu_bar_selected');	
		$("#assemble_button").attr('class', 'menu_bar');
		$("#assemble_area").hide();
	})
		$("#assemble_button").click(function() {
		$("#explore_area").hide();
		$("#search_area").hide();
		$("#edit_area").hide();
		$("#assemble_area").show();
		$("#preferences_area").hide();
		$("#explore_button").attr('class', 'menu_bar');
		$("#search_button").attr('class', 'menu_bar');
		$("#edit_button").attr('class', 'menu_bar');
		$("#preferences_button").attr('class', 'menu_bar');
		$("#assemble_button").attr('class', 'menu_bar_selected');	
		
	})
	    
    $("#detail_trigger").click(function () {
        $("#detail_panel").toggle("fast");
        $("#option_panel").hide();
        $("#perspective_panel").hide();
        $(this).toggleClass("active");
        return false;
    });
    
    $("#option_trigger").click(function () {
        $("#option_panel").toggle("fast");
        $("#detail_panel").hide();
        $("#perspective_panel").hide();
        $(this).toggleClass("active");
        return false;
    });
    
    $("#perspective_trigger").click(function () {
        $("#perspective_panel").toggle("fast");
        $("#detail_panel").hide();
        $("#option_panel").hide();
        $(this).toggleClass("active");
        return false;
    });
    
    $("#search_area").hide();
	$("#edit_area").hide();
	$("#preferences_area").hide();
	$("#edit_perspective").hide();
	$("#edit_productline").hide();
	$("#edit_stakeholder").hide();
	$("#assemble_area").hide();
    
    drawText(document.getElementById("detail_canvas"), "Details");
    drawText(document.getElementById("option_canvas"), "Options");
    drawText(document.getElementById("perspective_canvas"), "Perspectives");
    
    $(function(){
        $("input").keydown(function(e){
            if (e.keyCode == 13) {
                document.getElementById("search_button2").click();
                return false;
            }
        });
    });
    
    Array.prototype.remove = function(x) {
    	var from, to;
    	for (var i=0; i<this.length && !from; i++)
    		if (this[i] == x) from = to = i;    	    	
  		var rest = this.slice((to || from) + 1 || this.length);
  		this.length = from < 0 ? this.length + from : from;
  		return this.push.apply(this, rest);
	};
	Array.prototype.unique = function() {
	    var a = this.concat();
	    for(var i=0; i<a.length; ++i) {
	        for(var j=i+1; j<a.length; ++j) {
	            if(a[i] === a[j])
	                a.splice(j, 1);
	        }
	    }
    return a;
	};  
})
//////////////////////////////////////////////////////////////////////////////////////////////
//    Exported data																			//
//////////////////////////////////////////////////////////////////////////////////////////////
var ontologyDir = "scripts/loader/feature_pool.owl",
	file_adress = "http://wise.vub.ac.be/Members/lamia/variability/Feature_Assembly/FAM.owl#",
	repository,
	perspectives,
	owners,
	stakeholders,
	properties,
	object_properties,
	data_properties,
	keywords,
	productlines,
	abstract_features,
	concrete_features,
	option_features,
	features,
	dictionary;


//////////////////////////////////////////////////////////////////////////////////////////////
//    Properties that have to be showed in visualisation									//
//////////////////////////////////////////////////////////////////////////////////////////////
var property_list = ["Mandatory_Composition", "Optional_Composition", "Has_Option",
					 "has_Owner","has_Stakeholder", "Excludes","Extends",
					 "Impacts","Implies","Includes","Incompatible", "Requires",
					 "Same","Uses"];
var property_view = [true, true, true,
					 false, true, false, false, false,
					 false, false, false, false, false, false];
function resolvedProperty (property) {
	return (property_list.indexOf(property) != -1);
}


//////////////////////////////////////////////////////////////////////////////////////////////
//    accessors (to access the data from the jowl_loader)                  					//
//////////////////////////////////////////////////////////////////////////////////////////////
function getPerspectives(node) {return node.Belongs_to;}
function getDescription(node) {return node.has_Description;}
function getStandalone(node) {return node.Standalone;}
function getMandatoryChildren(node) {if (node.Mandatory_Composition) return node.Mandatory_Composition; else return [];}
function getOptionalChildren(node) {if (node.Optional_Composition) return node.Optional_Composition; else return [];}
function getOptions(node) {if (node.Has_Option) return node.Has_Option; else return [];}
function getOwner(node) {if (node.has_Owner) return node.has_Owner; else return [];}
function getStakeholders(node) {if (node.has_Stakeholder) return node.has_Stakeholder; else return [];}
		


var jOWL_loader = function(){
	var ready = false;
	
	function init(){
		repository = [];
		perspectives = [];
		owners = [];
		stakeholders = [];
		properties = [];
		object_properties = [];
		data_properties = [];
		keywords = [];
		productlines = [];
		abstract_features = [];
		concrete_features = [];
		option_features = [];
		features = [];
		dictionary = [];
	}
	
	function performQuery(query, raw) {
		var query_result = false;
		new jOWL.SPARQL_DL(query).execute({
			onComplete: function(obj){
				if (raw) query_result = obj.results;
				else query_result = obj.jOWLArray(x);
			}
		});
		return query_result;
	}
	
	var collection = [];
	
	function getAll(){
		return performQuery("Thing(?x)");
	}
    	
    function getIndividuals(node_name){
		return performQuery("Type(?thing, " + file_adress + node_name + ")", false);
	}
	
	function getType(node_name){
		return performQuery("Type(" + file_adress + node_name + ", ?type)", false);
	}
	
	function getProperties(node_name){
		if (node_name)
			return performQuery("PropertyValue(" + file_adress + node_name + ", ?property, ?value)", true);
		else
			return performQuery("PropertyValue(?thing, ?property, ?name), " + "Type(?thing, " + file_adress + "Feature)", true);
	}
	
	function getProperty(property_name){
		return performQuery("PropertyValue(?thing, " + file_adress + property_name + ", ?name), " + "Type(?thing, " + file_adress + "Feature)", true);
	}
	
	function isFeature(node_name) {
		var type = getType(node_name)[0].name;
		return (type == "Feature" || 
				type == "Concrete_Feature" || 
				type == "Abstract_Feature");
	}
	
    function collect (){
    	var raw_perspectives = getIndividuals("Perspective");
    	var raw_owners = getProperty("has_Owner");
    	var raw_stakeholders = getProperty("has_Stakeholder");
    	var raw_keywords = getIndividuals("Keywords");
    	var all_properties = getProperties();
    	var raw_productlines = getIndividuals("Product_Line");
    	var raw_abstract = getIndividuals("Abstract_Feature");
    	var raw_concrete = getIndividuals("Concrete_Feature");
    	//////////////////////////////////////////////////////
    	var raw_options = getIndividuals("Option_Feature");
    	//////////////////////////////////////////////////////
    	var raw_features = getIndividuals("Feature");
    	for (var i=0; i<raw_perspectives.length; i++)
    		perspectives.push(raw_perspectives[i].name);
    	for (var i=0; i<raw_stakeholders.length; i++)
    		if (owners.indexOf(raw_stakeholders[i]["?name"].name) == -1)
    		stakeholders.push(raw_stakeholders[i]["?name"].name);
    	for (var i=0; i<raw_owners.length; i++)
    		if (owners.indexOf(raw_owners[i]["?name"].name) == -1)
    		owners.push(raw_owners[i]["?name"].name);
    	for (var i=0; i<all_properties.length; i++)
    		if (properties.indexOf(all_properties[i]["?property"].name) == -1 &&
    			all_properties[i]["?property"].name != "Composition" &&
    			all_properties[i]["?property"].name != "FTFC")
    			properties.push(all_properties[i]["?property"].name);
    	for (var i=0; i<raw_keywords.length; i++)
    		keywords.push(raw_keywords[i].name);
    	for (var i=0; i<raw_productlines.length; i++)
    		productlines.push(raw_productlines[i].name);
    	for (var i=0; i<raw_abstract.length; i++)
    		abstract_features.push(raw_abstract[i].name);
    	for (var i=0; i<raw_concrete.length; i++)
    		concrete_features.push(raw_concrete[i].name);
    	for (var i=0; i<raw_options.length; i++)
    		option_features.push(raw_options[i].name);
    	for (var i=0; i<raw_features.length; i++)
    		features.push(raw_features[i].name);
    	properties.sort();
	collection = getAll();
		}
	
	function resolve(){
		collection.forEach(function(jowl_node, id){
			var node_adress = addNode(jowl_node.name, true, false);
			addChildren(repository[node_adress]);
		});
	}
    	
	function createNode(name, id, parent_id){
		var node = {},
		    properties = getProperties(name),
		    type = getType(name);
		
		function saveProperties () {
			for (var i=0; i<properties.length; i++) {
				var property = properties[i],
					property_name = property["?property"].name,
					property_value = property["?value"];
				if (typeof(property_value) == "object") property_value = property_value.name;
				if (!node[property_name])
					node[property_name] = [property_value];
				else
					node[property_name].push(property_value);
			}  			
		}
		
		saveProperties();
		node["type"]= type[0].name;
		node["_id"] = id;
		node["_root"] = true;
		node["_parent_id"] = parent_id;
		node["_option"] = node["Option_of"] != undefined;
		node["name"] = name;
		return node;
	}
	
	
	function addChildren(new_parent){
		function loopChildren(children, destination){
			for (var i=0; children && (i<children.length); i++) {
				var file_adress = addNode(children[i], false, new_parent._id);
				destination[i] = file_adress;
			}
		}
		for (var key in new_parent) {
			if (resolvedProperty (key))
			loopChildren(new_parent[key], repository[new_parent._id][key]);
		}			
	}

	function addNode(name, root, parent_id){
		var	requested_node = dictionarySearch(dictionary, name, false);
		if (!requested_node){
			var new_node = createNode(name, repository.length, parent_id);
			dictionaryAdd(dictionary, {name: new_node.name, index: repository.length});
			requested_node = repository.length;
			if (isFeature(new_node.name)) new_node._root = root;
			else new_node._root = false;
			repository.push(new_node);
			return requested_node;
		} else {
			repository[requested_node.index]._root = false;
			if (parent_id != false) repository[requested_node.index]._parent_id = parent_id;
			return requested_node.index;
		}
	}
			
	return {		    
		load:function(){
			ready = false;
			jOWL.load(ontologyDir, function () {
				init();
		    	collect();
		    	resolve();
		    	dictionarySort(dictionary);
		    	ready = true;
		    }, 
		    {reason: true});
		},
		ready:function(){
			return ready;
		},
		search:function(query, raw){
			return performQuery(query, raw);
		}
	};
}();
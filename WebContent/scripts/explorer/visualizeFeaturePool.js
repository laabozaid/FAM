var initialized = false,
	real_width, 
	real_height,
	concrete_color, concrete_bgcolor, 
    abstract_color, abstract_bgcolor,
    option_color, option_bgcolor,
    mandatory_color, mandatory_bgcolor,
    optional_color, optional_bgcolor,
    additional_color, additional_bgcolor,
    text_color = "#000000",  
	selected_color = "#8181F7",
	path_color = "#CECEF6", 
	background_color = "#FFFFFF",
	dummy_color = "#FFFFFF",
	node_weight = 1,
	setting,
	node_font = [10, 8],
	node_height = ['30', '18'], 
	node_width = ['80', '40'],
	symbol_scale = [8, 5],
	particleSystem;
	

//////////////////////////////////////////////////////////////////////////////////////////////
//Visualisation///////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////
var visualizeFeaturePool = function(){
    var roots,
    	perspective_names = [],
    	perspective_values =[],
    	sys, 
    	startDepth = 2, 
    	view_options = true,
    	view_compositions = true,
    	view_dependencies = false;
    	
    	

	//////////////////////////////////////////////////////////////////////////////////////////
	//visualizer renderer (controls the behaviour of the visualisation)///////////////////////
	//////////////////////////////////////////////////////////////////////////////////////////
	var Renderer = function(){
		var div = document.getElementById("explore_area"),
	    	canvas = document.getElementById("viewport"),
		    //Screen size
			cWidth = real_width =  canvas.width =  parseInt(div.style.width),
			cHeight = real_height =  canvas.height =  parseInt(div.style.height),
	    
	    	ctx = canvas.getContext('2d');
	    
	    return {
	        init:function(system){
	            //Define some particle system settings
	            particleSystem = system;
	            particleSystem.screenSize(cWidth, cHeight);
	            particleSystem.screenPadding(100);
	            //Clear canvas before (re)drawing
	            ctx.clearRect ( 0 , 0 , canvas.width , canvas.height );
	            //Node dragging
	            this.initMouseHandling();
	        },
	        redraw:function(){
	            //Set the canvas styles for every redraw
	            ctx.fillStyle = "white";
	            ctx.fillRect(0,0, real_width, real_height);
	            
	            //The lines between nodes
	            particleSystem.eachEdge(function(edge, pt1, pt2, node1, node2){
	                var height1 = node1.data._height,
	                	height2 = node2.data._height, 
	                	weight = node2.data._weight,
	                	use = edge.data._use;
	            		
	            	ctx.font = (node_font[setting]+weight) + 'px Verdana';
	                var width1 = Math.max(node1.data._width, (ctx.measureText(node1.data.name).width + 5));
	                var width2 = Math.max(node2.data._width, (ctx.measureText(node2.data.name).width + 5));
	            	var r11 = {x: pt1.x - width1/2, y: pt1.y - height1/2}; r12 = {x: pt1.x + width1/2, y: pt1.y - height1/2};
	            	var r13 = {x: pt1.x + width1/2, y: pt1.y + height1/2}; r14 = {x: pt1.x - width1/2, y: pt1.y + height1/2};
	                var r21 = {x: pt2.x - width2/2, y: pt2.y - height2/2}; r22 = {x: pt2.x + width2/2, y: pt2.y - height2/2};
	            	var r23 = {x: pt2.x + width2/2, y: pt2.y + height2/2}; r24 = {x: pt2.x - width2/2, y: pt2.y + height2/2};
	            	var intersection1 = intersectLineRectangle(pt1, pt2, r11, r12, r13, r14);
	            	var intersection2 = intersectLineRectangle(pt1, pt2, r21, r22, r23, r24);
	            	
	                if (intersection1) pt1 = intersection1;
	                if (intersection2) pt2 = intersection2;
	                var C = {"x" : (pt2.x - pt1.x), "y" : (pt2.y - pt1.y)}, scale;
	                if (use == 'Mandatory_Composition' || use == 'Optional_composition')
	                	scale = symbol_scale[setting]/(Math.sqrt((C.x*C.x) + (C.y*C.y)));
					else 
						scale = symbol_scale[0]/(Math.sqrt((C.x*C.x) + (C.y*C.y)));
	                C = {"x" : C.x*scale, "y" : C.y*scale};
	                var A = {"x" : pt2.x - C.x, "y" : pt2.y - C.y},
	                    B = {"x" : -C.y / 2, "y" : C.x / 2},
	                    J = {"x" : B.x*(-1), "y" : B.y*(-1)},
	                    E = {"x" : A.x+B.x, "y" : A.y+B.y},
	                    D = {"x" : A.x+J.x, "y" : A.y+J.y},
	                    K = {"x" : pt2.x - C.x*2.5, "y" : pt2.y - C.y*2.5};
					ctx.lineWidth = 1;
					ctx.beginPath();
					switch (use) {
						case 'Has_Option':
							ctx.strokeStyle = ctx.fillStyle = mandatory_color;
							ctx.moveTo(pt1.x, pt1.y);
							ctx.lineTo(pt2.x, pt2.y);
            				ctx.stroke();
			                ctx.beginPath();
			                ctx.moveTo(pt2.x, pt2.y);
		                	ctx.lineTo(E.x, E.y);
		                	ctx.lineTo(D.x, D.y);
		                	ctx.closePath();
		            		ctx.fill();
		                	break;
						case 'Mandatory_Composition':
							ctx.strokeStyle = ctx.fillStyle = mandatory_color;
	                		ctx.moveTo(pt1.x, pt1.y);
							ctx.lineTo(K.x, K.y);
                			ctx.stroke();
			                ctx.beginPath();
			                ctx.moveTo(E.x, E.y);
			                ctx.lineTo(K.x, K.y);
			                ctx.lineTo(D.x, D.y);
			                ctx.lineTo(pt2.x, pt2.y);
		                	ctx.closePath();
		            		ctx.fill();			                
			                break;
						case 'Optional_Composition':
							ctx.strokeStyle = ctx.fillStyle = optional_color;
							ctx.dashedLine(pt1, K);
                			ctx.stroke();
			                ctx.beginPath();
			                ctx.moveTo(E.x, E.y);
			                ctx.lineTo(K.x, K.y);
			                ctx.lineTo(D.x, D.y);
			                ctx.lineTo(pt2.x, pt2.y);
		                	ctx.closePath();
		            		ctx.fill();			                
			                break;
			            default:
			            	var r5 = {"x" : pt1.x - width1/2, "y" : pt1.y - height1/2},
				                r6 = {"x" : pt1.x + width1/2, "y" : pt1.y - height1/2},
				            	r7 = {"x" : pt1.x + width1/2, "y" : pt1.y + height1/2}, 
				            	r8 = {"x" : pt1.x - width1/2, "y" : pt1.y + height1/2},
			            		intersection2 = intersectLineRectangle(pt1, pt2, r5, r6, r7, r8);
			            		
			            	ctx.font = '700 8pt verdana';
						    txt_width = ctx.measureText(use).width;
						    edge_width = Math.sqrt(Math.pow((pt2.x - pt1.x), 2) + Math.pow((pt2.y - pt1.y), 2));
						    						    
						    if (txt_width + 15 < edge_width) {
						    	var side1 = edge_width,
						    		side2 = Math.abs(pt2.y - pt1.y),
						    		rad = Math.asin(side2/side1),
						    		offset_x, offset_y;
						    	if (((pt1.x-pt2.x) > 0 && (pt1.y-pt2.y)<0) || ((pt1.x-pt2.x) < 0 && (pt1.y-pt2.y)>0)) rad = - rad;
						    	offset_x = Math.cos(rad)*((txt_width/2) + 15),
						    	offset_y = Math.sin(rad)*((txt_width/2) + 15) + 5;
						    	ctx.save();
						    	if (pt1.x > pt2.x) ctx.translate(intersection2.x - offset_x, intersection2.y - offset_y);
						    	else ctx.translate(intersection2.x + offset_x, intersection2.y + offset_y);
						    	ctx.rotate(rad);
						    	ctx.textalign="center";
						    	ctx.fillText(use, 0, 0);
						    	ctx.restore();
						    }
						    
			            	ctx.strokeStyle = additional_color;
							ctx.dashedLine(pt1, pt2, 2);
            				ctx.stroke();
					}
	                ctx.stroke();
	            });
	            
	            //The style of each node
	            particleSystem.eachNode(function(node, pt){
	                var txt = node.data.name, h = node.data._height, w,
	        			selected = node.data._selected, weight = node.data._weight,
	        			use = node.data._use, option = node.data._option, dashed = false, dashedLen = 0, color1, color2;
	               
	               if (node.name == "dummy") {
	                	ctx.strokeStyle = dummy_color;
	                	txt = "";
	                }
	                ctx.font = (node_font[setting]+weight) + 'px Verdana';
	                w = Math.max(node.data._width, (ctx.measureText(txt).width)) + 10;
	                pt1 = {x:pt.x - w/2, y: pt.y - h/2}; 
	                pt2 = {x:pt.x + w/2, y: pt.y - h/2};
	        		pt3 = {x:pt.x + w/2, y: pt.y + h/2}; 
	        		pt4 = {x:pt.x - w/2, y: pt.y + h/2};
	        		
	        		
		        	
		       		switch (use) {
		       			case 'Feature':
		       				color1 = option_bgcolor;
		       				color2 = option_color;
			        		break;
		       			case 'Concrete_Feature':
		       				if (option) {
			       					color1 = option_bgcolor;
			       					color2 = option_color;}
			       				else {
			       					color1 = concrete_bgcolor;
			       					color2 = concrete_color;} break;
		       			case 'has_Owner':
			       			color1 = additional_bgcolor;
			       			color2 = additional_color;
			        		break;
			        	case 'Abstract_Feature':
			       			if (option) {
			       					color1 = option_bgcolor;
			       					color2 = option_color;}
			       				else {
			       					color1 = abstract_bgcolor;
			       					color2 = abstract_color;}
			       			dashed = true;
		        			break;
			        	default:
			       			if (option) {
			       					color1 = option_bgcolor;
			       					color2 = option_color;}
			       				else {
			       					color1 = additional_bgcolor;
			       					color2 = additional_color;}
			       			dashed = true;
			       			dashedLen = 2;
		       		}
		       		//Create our different types of nodes
	                ctx.lineWidth = weight;  
		       		ctx.beginPath();
		       		if (selected == 0) ctx.fillStyle = color1;
		       		else if (selected == 1) ctx.fillStyle = selected_color;
		       		else if (selected == 2) ctx.fillStyle = lighterColor(selected_color, 0.2);
		        	ctx.moveTo(pt1.x, pt1.y);
			       	ctx.strokeStyle = color2;
		        	ctx.roundRectangle(pt1, pt2, pt3, pt4, dashed, dashedLen);
		        	ctx.closePath();
		        	ctx.stroke();
		        	if (selected == 0) ctx.fillStyle = adjustColor(color1);
		       		else if (selected == 1) ctx.fillStyle = adjustColor(selected_color);
		       		else if (selected == 2) ctx.fillStyle = adjustColor(lighterColor(selected_color, 0.2));
					ctx.textBaseline = 'middle';
					ctx.textAlign = 'center';
					ctx.fillText(txt, pt.x, pt.y);
	            });
	        },
	        lookupChildren: function(children_ids, key) {
				var names = [];
				children_ids.forEach(function (child_id, id){
					var node = repository[child_id],
						perspectives = getPerspectives(node),
						info = node.name;
					if ((key == 'Mandatory_Composition' || key == 'Optional_Composition')
						&& !view_compositions)
						info += "<br /> <i>&nbsp &nbsp(requires visualisation of compositions) </i>";
					if (key == 'Has_Option' && !view_options)
						info += "<br /> <i> &nbsp &nbsp(requires visualisation of options) </i>";
					if (perspectives && !controlPerspectives(perspectives))
						info += "<br /> <i> &nbsp &nbsp(requires " + perspectives[0] + "</i>)";
					names.push(info);
						 
				});
				return names;
			},
			
			collectProperties: function(node) {
				var name, type, parentkey = [], parentval = [],
					relation_names = [], relation_values = [],
					perspective_names = [], perspective_values = [],
					stakeholder_names = [], stakeholder_values = [],
					dependency_names = [], dependency_values = [];
				for (var key in node) {
					if (key[0] != "_" || key == "_parent_id") {
						var value = node[key];
						if (typeof(value) == "object" && typeof(value[0]) == "number") 
							value = particleSystem.renderer.lookupChildren(value, key);
						switch (key) {
							case '_parent_id': if(value) {
												parentval.push(value);
												parentkey.push("Parent");} break;
							case 'name': name = value; break;
							case 'type': type = value; break;
							case 'Mandatory_Composition':
							case 'Optional_Composition':
							case 'Has_Option': 
							case 'Option_of':
							case 'Used_in':
							case 'has_Binding_Time':
							case 'has_Keyword':
							case 'has_Perspective':
								relation_names.push(key);
								relation_values.push(value); break;
							case 'has_Owner':
								relation_names.push(key);
								relation_values.push(value); break;
							case 'has_Stakeholder':
								stakeholder_names.push(key);
								stakeholder_values.push(value); break;
							case 'Belongs_to':
								perspective_names.push(key);
								perspective_values.push(value); break;
							case 'FTFC':
							case 'Composition': break;
							default : 
								dependency_names.push(key);
								dependency_values.push(value);
						}
					}
				}
				return [[["Name", "Type"].concat(parentkey), relation_names.concat(perspective_names).concat(stakeholder_names), dependency_names], 
						[[name, type].concat(parentval), relation_values.concat(perspective_values).concat(stakeholder_values), dependency_values]];
			},
			
	        select:function(node, path){
					var details = node.data;
					particleSystem.stop();
	                if (!path)
	                	particleSystem.eachNode(function(node, pt){
							node.data._selected = 0;
							node.data._weight = node_weight;
						});
					details._selected = 1;
					particleSystem.renderer.redraw();
					
					details = particleSystem.renderer.collectProperties(details); 
					updateDetailpanel(details);
					if ($('#detail_panel').is(":hidden")){
						$("#detail_trigger").click();
					}
				},
				
			expand: function(selected) {
				if (selected===null || selected.node===undefined) return;
	            if (selected.node !== null) selected.node._fixed = false;
	            if(!selected.node.data._expanded){
		          selected.node.data._expanded = true;
		          visualizeFeaturePool.generateChildren(selected.node.data);
		        } else {
				  //Node expanded so remove
				  visualizeFeaturePool.removeNodes(selected.node.name);		  
				}
	            selected.node.tempMass = 1000;
			}, 
			
	        initMouseHandling: function(){
				var _mouseP, selected,
					dragged = null,
					nearest = null,
					down = false;
				
				var handler = {
					position: function(e){
						var pos = $(canvas).offset();
	                    _mouseP = arbor.Point(e.pageX-pos.left, e.pageY-pos.top);
	                    selected = particleSystem.nearest(_mouseP);
					},
					doubleclicked:function(e){
						particleSystem.renderer.select(selected.node);
						selected = null;
						_mouseP = null;
					},
					clicked:function(e){
	                    $(canvas).bind('mousemove', handler.dragged);
	                    if (!down) handler.dropped(e);
	                    else $(window).bind('mouseup', handler.dropped);
	                    return false;
	                },
	                dragged:function(e){
	                	var pos = $(canvas).offset();
	                    var s = arbor.Point(e.pageX-pos.left, e.pageY-pos.top);
	                    
	                    if (selected && selected.node !== null){
	                        var p = particleSystem.fromScreen(s);
	                        selected.node.p = p;
	                        dragged = true;
	                    }                
	                    return false;
	                },
	                dropped:function(e){
	                	if (!dragged) particleSystem.renderer.expand(selected);
	                    $(canvas).unbind('mousemove', handler.dragged);
	                    $(window).unbind('mouseup', handler.dropped);
	                    selected = null;
	                    _mouseP = null;
	                    dragged = false;
	                    return false;
	                }                
	            }
	
	            // start listening
	            $(canvas).mousedown(function(e){down = true; if (!selected) handler.position(e);});
	            $(canvas).mouseup(function(e){down = false;});
	            $(canvas).single_double_click(handler.clicked, handler.doubleclicked);
	            $(window).dblclick(function(event){event.preventDefault();});
	        }
	    }
	}


	//////////////////////////////////////////////////////////////////////////////////////////
	//visualizer functions (gives the information from the jowl_loader to the visualisation)//
	//////////////////////////////////////////////////////////////////////////////////////////
	
	function addDummy(){
		//dummynodes to solve the single-node bug in the visualisation
		var node_option = {name:"", _use: 'dummy', _height: '1', _width: '1', _selected: 0,
    					   _weight: node_weight, _level: 0, _expanded: true}
		sys.addNode();	
	}
	
	function getRoots(){
		var return_val = [];
		for (var i=0; i<repository.length; i++) {
			if (repository[i]._root) {
				return_val.push(i)
			}
		}
		return return_val;
	}
	
	function addNode (id, level, expanded, use, option){
    	var current_node, node_options;
    	
    	if (id) current_node = repository[id];
    	else current_node = repository.length;
    	
    	node_options = jQuery.extend({_use: use, _option: option, _height: node_height[setting], _width: node_width[setting],
    								  _weight: node_weight, _selected: 0, _level: level, _expanded: expanded}, current_node);
    	sys.addNode(current_node.name, node_options);  	
    }
    
    function viewProperty(property_name, value) {
    	for (var i = 0; i<property_list.length; i++) {
    		if (property_list[i] == property_name)
    			if (value)
    				return property_view[i] = value;
    			else
    				return property_view[i];
    	}
    }
	        
	function insertionLoop (level, limit, current_id, forced){
    	if (level < limit){
    		var current_node = repository[current_id],
    			addedNodes = [],
    			use;
    		
    		function childLoop(source, use) {
    			$.each(source, function(i, child_id){
    				var perspectives = getPerspectives(repository[child_id]),
    					type = repository[child_id]["type"],
    					option = repository[child_id]["_option"];
            		if (!perspectives || controlPerspectives(perspectives) || forced) 
    				   {addNode(child_id, level, (level<limit-1), type, option);
    				    addedNodes.push(child_id);
    					sys.addEdge(current_node.name, repository[child_id].name, {length:0.75, _use:use});}
    			})
    		}
    		
    		
    		for (var property in current_node)
    			if (resolvedProperty(property) && viewProperty(property))
    				childLoop(current_node[property], property);
    		
			// go down in hyriarchy until maximal startdepth is reached
    		$.each(addedNodes, function(i, new_id) {
    			insertionLoop(level+1, limit, new_id, forced);
    		});
    		return addedNodes.length > 0;
    	}
    	else return false;
    }
    
    function removeLoop(start_node, forced) {
		function remove_group (group){
			$.each(group, function (i, id) {
				var perspectives = getPerspectives(repository[id]);
				if ((perspectives && !controlPerspectives(perspectives)) || forced)
					sys.pruneNode(repository[id].name);
				removeLoop(repository[id], true);
			});
		}
		remove_group(getMandatoryChildren(start_node));
		remove_group(getOptionalChildren(start_node));
		remove_group(getOptions(start_node));
		remove_group(getOwner(start_node));
		remove_group(getStakeholders(start_node));
	}
    	
    function controlPerspectives(perspectives_of_node) {
		var result = false;
		perspective_names.forEach(function (name1, id1){
			if(!result){
				perspectives_of_node.forEach(function(name2, id2){
				if (name1 == name2) result = perspective_values[id1];
				})
			}
		})
		return result;
    }
    	
    return {
        init:function(){
        	if (!initialized) {
        		sys = arbor.ParticleSystem();
	            sys.parameters({friction:0.01, stiffness:700, repulsion:500, gravity: true, fps: 40, dt: 0.02, precision: 0.6});
	            if (!setting)
	            	if (window.innerWidth >= 1024) setting = 0;
	            	else setting = 1;
	            visualizeFeaturePool.loadFile();
	            //Start the renderer
	            sys.renderer = Renderer();
	            initialized = true;
	            addDummy();
        	} else {
        		sys.eachNode(function(node, pt){
					var name = node.data.name;
					sys.pruneNode(name);
				})
				//prevent single-node bug
				addDummy();
        	}
        },
                
		removeNodes: function(name){
			//Clicked node
			var clicked = sys.getNode(name);
			//Node is nolonger expanded
			clicked.data._expanded = false;
			//Remove Children
			removeLoop(clicked.data, true);
		},
        
       loadFile:function(){
        	var first=true;
        	
            //add a dummy_node to solve single-node bug in visualistion
            repository.push();
            perspectives.forEach(function(perspective, id){
            	perspective_names.push(perspective);
            	perspective_values.push(first);
            	first=false;
            })            
            roots = getRoots();
        },
        
        showRoots: function(){
        	roots.forEach(function(root_id, id){
            	var perspectives = getPerspectives(repository[root_id]);
            	if ((!perspectives || controlPerspectives(perspectives)) && !repository[root_id]["Option_of"]) {
            	    addNode(root_id, 0, (0<startDepth), repository[root_id]["type"], repository[root_id]["_option"]);
            		insertionLoop(1, startDepth, root_id, false);
            	}
            })
        },
        
        gotoNode: function(node_id){
        	var path = [], perspectives = [];
        	
        	function collectIds(){
        		var parent_id;
        		while (node_id){
        			parent_id = repository[node_id]._parent_id;
        			path.push(node_id);
        			node_id = parent_id;
        		}
        	}
        	function traversePath(ctr){
        		addNode(path[ctr], 0, true, repository[path[ctr]]["type"], repository[path[ctr]]["_option"]);
        		while (ctr >= 0)
        		   {var current_id = path[ctr],
        		   		current_node = repository[current_id],
        		   		level = path.length-ctr,
        		   		expanded;
        		   		
        		   	current_node["Belongs_to"].forEach(function(perspective, id) {
        		   		var index = perspective_names.indexOf(perspective);
        		   		perspective_values[index] = true;
        		   		document.getElementById(perspective).checked = true;	
        		   	})
					
					expanded = insertionLoop(level, level+1, current_id, true);
        			sys.getNode(current_node.name).data._expanded = ((ctr > 0) && expanded);
        			ctr -= 1;
        		   }
        	}
        	
        	function showPath(distance){
        		for (var i=0; i<distance; i++) {
        			var id = path[i],
        				node = repository[id],
        				sys_node = sys.getNode(node.name);
        			if (i == 0) {
        				particleSystem.renderer.select(sys_node, true);
        				sys_node.data._weight *= 2;
        				sys_node.data._selected = 1;
        			}else{
        				sys_node.data._selected = 2;}
        			sys.renderer.redraw();
        		}
        	}
        	collectIds();
        	traversePath(path.length-1);
        	if (document.getElementById("show_path").checked)
        		showPath(path.length);
        	else
        		showPath(1);    	
        },
        
        infoNode: function(id){
        	var offset = window.innerHeight/2,
        		info = particleSystem.renderer.collectProperties(repository[id]),
        		div_contents = showDetails(info, true);
        	 $('body').jAlert(div_contents, 'info', offset);	
        },
	    
	    generateChildren: function(node){
        	insertionLoop(node._level, (node._level+1), node._id, false)
        },
        
        initPerspectives: function(){
			perspective_names.forEach(function(perspective, id){
				document.getElementById(perspective).checked = false;
				perspective_values[id]=false;
			});
		},
    
			
		toggleOptions: function(){
			if (view_options == false) {
				view_options = true;
				sys.eachNode(function(node, pt){
					var options = getOptions(node.data);
					$.each(options, function(i, id) {
						node.data._expanded = true;
						insertionLoop(node.data._level, (node.data._level + 1), node.data._id, false);
					})
				})
			}else{
				view_options = false;
				sys.eachNode(function(node, pt){
					var options = getOptions(node.data);;
					$.each(options, function(i, id) {
						sys.pruneNode(repository[id].name);
						removeLoop(repository[id], false);
					})
				})
			}
		},
		
		toggleCompositions: function(){
			if (view_compositions == false) {
				view_compositions = true;
			}else{
				view_compositions = false;
				sys.eachNode(function(node, pt){
					var mandatory_compositions = getMandatoryChildren(node.data),
						optional_compositions = getOptionalChildren(node.data);
					$.each(mandatory_compositions.concat(optional_compositions), function(i, id) {
						if(!node.data._root) {
						  sys.pruneNode(repository[id].name);
						  removeLoop(repository[id], false);
						}
					})	
				})
			}
		},
		
		toggleDependencies: function(){
			if (view_dependencies == false) {
				view_dependencies = true;
			} else {
				view_dependencies = false;
			}
		},
		
		setPerspectives: function(){
			perspective_names.forEach(function(perspective, id){
				var checked = document.getElementById(perspective).checked;
				perspective_values[id]=checked;
			});
			roots.forEach(function(root_id, id){
            	var perspectives = getPerspectives(repository[root_id]);
            	if (!perspectives || controlPerspectives(perspectives)){ 
            		addNode(root_id, 0, (0<startDepth), repository[root_id]["type"], repository[root_id]["_option"]);
            		insertionLoop(1, startDepth, root_id, false);
            	} else {
            		sys.pruneNode(repository[root_id].name);
            		removeLoop(repository[root_id], true);
            	}
            })
		},
		
		setViews: function() {
			property_list.forEach(function(view, id) {
				var checked = document.getElementById(view).checked;
				property_view[id]=checked;
			});	
		},
		
		setColor: function(type, color) {
	    	switch (type){
				case "concrete":   concrete_color = color; concrete_bgcolor = lighterColor(color, 0.75); break;
				case "abstract":   abstract_color = color; abstract_bgcolor = lighterColor(color, 0.75); break;
				case "option":     option_color = color; option_bgcolor = lighterColor(color, 0.75); break;
				case "mandatory":  mandatory_color = color; mandatory_bgcolor = lighterColor(color, 0.75); break;
				case "optional" :  optional_color = color; optional_bgcolor = lighterColor(color,0.75); break;
				case "additional": additional_color = color; additional_bgcolor = lighterColor(color, 0.75); break;
				case "selection" : selected_color = color; path_color = lighterColor(color, 0.75); break;
 			}
    	},
		initColors: function(){
			function initColor(id) {
				var element = document.getElementById(id + "_color");
				visualizeFeaturePool.setColor(id, element.value);
			}
			initColor("concrete");
  			initColor("abstract");
    		initColor("option");
    		initColor("mandatory");
    		initColor("optional");
    		initColor("additional");
		},	
		zoom: function(direction){
			var canvas = document.getElementById("viewport");
			if (direction == "in") {
				real_width = canvas.width *= 1.25;
				real_height = canvas.height *= 1.25;
			} else if (direction == "out") {
				real_width = canvas.width /= 1.25;
				real_height = canvas.height /= 1.25;
			}			
			sys.screenSize(real_width, real_height);
			sys.start();
   		},
    };
}();




//Exported
function explore () {
	visualizeFeaturePool.init();
	visualizeFeaturePool.initColors();
	visualizeFeaturePool.showRoots();
}

function zoom(direction) {
	visualizeFeaturePool.zoom(direction);
}

function setColor(type, color){
	visualizeFeaturePool.setColor(type, color);
	particleSystem.renderer.redraw();
}

function updateViews() {
	visualizeFeaturePool.setViews();
}

function updatePerspectives(){
	visualizeFeaturePool.setPerspectives();
}

function gotoNode(idx){
	$("#explore_button").click();
	visualizeFeaturePool.init();
	visualizeFeaturePool.initPerspectives();
	visualizeFeaturePool.showRoots();
	visualizeFeaturePool.gotoNode(idx);
}

function infoNode(idx) {
	visualizeFeaturePool.infoNode(idx);
}
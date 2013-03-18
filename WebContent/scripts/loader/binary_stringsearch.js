////////////////////////////////////////////////////////////
// Code based on the binary Stringsearch:				  //
// https://github.com/jeresig/trie-js/blob/master/util.js //
////////////////////////////////////////////////////////////

sort_by = function(field, reverse, primer){
	var key = function (x) {return primer ? primer(x[field]) : x[field];};
    
	return function (a,b) {
		var A = key(a), B = key(b);
	    return (A < B ? -1 : (A > B ? 1 : 0)) * [1,-1][+!!reverse];                 
	};
};

dictionaryAdd = function(dictionary, name_index) {
	var name = name_index.name;
	while (dictionary.length < (name.length + 1)) {
		dictionary.push([]);
	}
	dictionary[name.length].push(name_index);
};

dictionarySort = function(dictionary, section) {
	if (section)
		dictionary[section].sort(sort_by('name', false, function(x){return x.toLowerCase();}));
		for (var i=0; i<dictionary.length; i++)
			dictionary[i].sort(sort_by('name', false, function(x){return x.toLowerCase();}));
};

dictionarySearch = function(dictionary, name, binary) {
	var l = name.length;
	if (l > (dictionary.length - 1)) return false;
	
	var values = dictionary[l].length,
		low = 0, 
		high = values - 1, 
		mid = Math.floor( values / 2 );
	
	while ( high >= low ) {
		var found;
		
		if (binary) found = dictionary[l][mid];
		else found = dictionary[l][low];
		
		if (name == found.name) {
			return found;
		}
		
		if (binary) {
			if ( name.toLowerCase() < found.name.toLowerCase()) high = mid - 1;
			else low = mid + 1;
			mid = Math.floor( (low + high) / 2 );
		} else {
			low = low+1;
		}
	}
	return false;
};
function store_data()
{
	var form = document.getElementById("preferences");
	
	localStorage.setItem("language", form.language.value);
	localStorage.setItem("detailmode", form.detailmode.checked);
	localStorage.setItem("detailpanel", form.detailpanel.checked);
	localStorage.setItem("standalone", form.standalone.checked);
	localStorage.setItem("autosave", form.autosave.checked);
}

function load_data()
{
	var form = document.getElementById("preferences");
	
	(localStorage.getItem("language") == "dutch") ? form.language.value="dutch" : form.language.value="english";
	(localStorage.getItem("detailmode") == "true") ? form.detailmode.checked=true : form.detailmode.checked=false;
	(localStorage.getItem("detailpanel") == "true") ? form.detailpanel.checked=true : form.detailpanel.checked=false;
	(localStorage.getItem("standalone") == "true") ? form.standalone.checked=true : form.standalone.checked=false;
	(localStorage.getItem("autosave") == "true") ? form.autosave.checked=true : form.autosave.checked=false;
}

function reset_data()
{
	localStorage.clear();
}
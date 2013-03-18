/**
 * This file is responsible for the Assembler code 
 * Lamia 
 * 
 */

var C_productline= document.getElementById("APL");
alert ("APL"+C_productline);
for (i=0; i<5; i++)
	{
		var option = document.createElement("OPTION");
		option.text = "PL"+i;
		option.value="PL"+i;
		C_productline.options.add(option);
	}

/*var busy = false;



function send(message){
	busy = true;
	var request = new XMLHttpRequest();
	request.open("POST", "configurator", true);
	request.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
	request.send(message);
	request.onreadystatechange = function() {busy = false;};
}
*/
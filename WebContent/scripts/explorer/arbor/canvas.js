if (window.CanvasRenderingContext2D && CanvasRenderingContext2D.prototype.lineTo){
			CanvasRenderingContext2D.prototype.dashedLine = function(pt1, pt2, dashLen) {
				    if (dashLen == undefined) dashLen = 6;
				    
				    var dX = pt2.x - pt1.x;
				    var dY = pt2.y - pt1.y;
				    var dashes = Math.floor(Math.sqrt(dX * dX + dY * dY) / dashLen);
				    var dashX = dX / dashes;
				    var dashY = dY / dashes;
				    
				    var q = 0;
				    while (q++ < dashes) {
				     pt1.x += dashX;
				     pt1.y += dashY;
				     this[q % 2 == 0 ? 'moveTo' : 'lineTo'](pt1.x, pt1.y);
				    }
				    this[q % 2 == 0 ? 'moveTo' : 'lineTo'](pt2.x, pt2.y);
				};
			CanvasRenderingContext2D.prototype.roundRectangle = function(pt1, pt2, pt3, pt4, dashed, dashLen) {
				  function line(ctx, x1, y1, x2, y2, dashed) {
				  	if (dashed) ctx.dashedLine({x:x1, y:y1}, {x:x2, y:y2});
				  	else ctx.lineTo(x2,y2);
				  }
				  var radius = 8;
				  if (dashed) {
				  	var color = this.strokeStyle;
				  	this.strokeStyle = "#FFFFFF";
				  	this.roundRectangle(pt1, pt2, pt3, pt4);
				  	this.strokeStyle = color;}
				  this.beginPath();
				  line(this, pt1.x + radius, pt1.y, pt2.x - radius, pt2.y, dashed);
				  this.quadraticCurveTo(pt2.x, pt2.y, pt2.x, pt2.y + radius);
				  line(this, pt2.x, pt2.y + radius, pt3.x, pt3.y - radius, dashed);
				  this.quadraticCurveTo(pt3.x, pt3.y, pt3.x - radius, pt3.y);
				  line(this, pt3.x - radius, pt3.y, pt4.x + radius, pt4.y, dashed);
				  this.quadraticCurveTo(pt4.x, pt4.y, pt4.x, pt4.y - radius);
				  line(this, pt4.x, pt4.y - radius, pt1.x, pt1.y + radius, dashed);
				  this.quadraticCurveTo(pt1.x, pt1.y, pt1.x + radius, pt1.y);
				  line(this, pt1.x + radius, pt1.y, pt2.x - radius, pt2.y, dashed);
				  
				  this.closePath();
				  this.stroke();
				  this.fill();
			}
}
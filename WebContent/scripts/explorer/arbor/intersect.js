intersectLineLine = function(a1, a2, b1, b2) {
    var result;
    
    var ua_t = (b2.x - b1.x) * (a1.y - b1.y) - (b2.y - b1.y) * (a1.x - b1.x);
    var ub_t = (a2.x - a1.x) * (a1.y - b1.y) - (a2.y - a1.y) * (a1.x - b1.x);
    var u_b  = (b2.y - b1.y) * (a2.x - a1.x) - (b2.x - b1.x) * (a2.y - a1.y);

    var ua = ua_t / u_b;
    var ub = ub_t / u_b;

	if ( 0 <= ua && ua <= 1 && 0 <= ub && ub <= 1 ) {
       return {"x" : a1.x + ua * (a2.x - a1.x), "y" : a1.y + ua * (a2.y - a1.y)};
	} else {
		return false;
	}
};




intersectLineRectangle = function(a1, a2, r1, r2, r3, r4) {
    
    var res1 = intersectLineLine(r1, r2, a1, a2);
    var res2 = intersectLineLine(r2, r3, a1, a2);
    var res3 = intersectLineLine(r3, r4, a1, a2);
    var res4 = intersectLineLine(r4, r1, a1, a2);
    if (res1)
    	{return res1;}
    else if (res2)
    	{return res2;}
	else if (res3)
		{return res3;}
	else if (res4)
		{return res4;}
};
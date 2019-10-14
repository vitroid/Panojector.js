let img;
                    
function preload()
{
    img = loadImage("./sample3.jpg");
}


function setup()
{
    var userfunc = function(v){
	//return mer2equi(equi2mer(v));
	//return equi2ste.func(v);
	//return slope.func(scaling.func(mer2equi(equi2ste.func(tileclop.func(v)))));
	return slope.func(scaling.func(mer2equi(equi2ste.func(v))));
	//return scaling.func(v);
	//return slide.func(v);
    };

    var w = img.width;
    var h = img.height;
    console.log(w,h);
    var cslope    = new CSlope(h/w);
    var slope     = new Slope(h/w*3, 3);
    var equi2ste = new Equi2Ste(900.0);
    var scaling  = new Scaling(0.2, 0.2);
    var slide    = new Slide(0., 0.);
    
    var canvas = projection(img, 400, userfunc, interpolate);
    createCanvas(400, 400);
    image(canvas, 0, 0);
    //canvas = projection(img, 400, userfunc, interpolate);
    canvas.save("test", "jpg");
    //noLoop();
}




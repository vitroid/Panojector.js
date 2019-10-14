function equi2mer(v)
{
    var tx = v.re;
    var ty = 2.0*Math.atan(Math.exp(v.im*math.pi))/math.pi - 0.5;
    return math.complex(tx, ty);
}

function mer2equi(v)
{
    var theta = v.im * math.pi;
    var tx    = v.re;
    var ty    = log( tan(math.pi/4.0 + theta/2.0) ) / math.pi;
    return math.complex(tx, ty);
}



class Slide
{
  constructor(x, y){
    this.displace = math.complex(-x,-y);
  }
  func(dst)
  {
    return math.add(dst, this.displace);
  } 
}




class Scaling
{
  constructor(scalex, scaley){
    this.scalex = scalex;
    this.scaley = scaley;
  }
  func(dst)
  {
      var dstx=dst.re / this.scalex;
      //padding
    /*if ( dstx < -1.0 )
	  dstx = -1.0;
    else if ( dstx > 1.0 )
	  dstx = 1.0;
    */
    var dsty = dst.im / this.scaley;
    return math.complex(dstx,dsty);
  } 
}


// tesselate and pick one
class TileCrop
{
    constructor(x,y,n){
	this.x = x;
	this.y = y;
	this.n = n;
    }
    func(dst)
    {
	var x = (dst.re + this.x) / this.n;
	var y = (dst.im + this.y) / this.n;
	return math.complex(x,y);
    } 
}



class Equi2Ste
{
  constructor(fov){
    this.lmax = Math.tan(fov * math.pi / (180.0*4.0));
  }
  func(dst)
  {
    var L = 2.0*this.lmax*math.abs(dst);
    var theta =  0.5 - 2.0 * atan( L / 2.0 ) / math.pi;
    var phi;
    if ( dst.re == 0 ){
      phi = 0.25; //math.pi / 2.0;
      if ( dst.im < 0.0 ){
	    phi += 0.5; //math.pi;
      }
    }
    else{
      phi = atan2( dst.im, dst.re ) / (2.0*math.pi);
    }
    phi -= floor( phi + 0.5 ); // * (2.0*math.pi);
    phi *= 2; ///= math.pi;
    return math.complex(phi, theta);
  }
}


//slope
class Slope
{
  constructor(aspect, story){
    this.aspect = aspect;
    var bw = 2.0 / story;
    this.L = sqrt(2.0*2.0 + bw*bw); // a period of the slant image
    this.h = 2.0*bw / this.L;            // height of the slant image
    this.offset = (this.L-sqrt(this.L*this.L-4*this.h*this.h))/2.0;
    this.e1x = 2.0/this.L;
    this.e1y = bw/this.L;
    this.e2x = -bw/this.L;
    this.e2y = 2.0/this.L;
  }
  func(dst){
    var dstx = dst.re;
    var dsty = dst.im;
    var sx = dstx*this.e1x + dsty*this.e1y;
    var sy = dstx*this.e2x + dsty*this.e2y;
    var dy = floor( sy / this.h + 0.5 );
    sy -= this.h*dy;
    sx += (this.L-this.offset)*dy;
    sx = sx / this.h * this.aspect * 2.0;
    sy = sy / this.h * this.aspect * 2.0;
    sx -= floor( sx/2.0 + 0.5 )*2.0;
    return math.complex(sx, sy);
  }
};


//Commensurate slope
class CSlope
{
  constructor(aspect){
    this.aspect = aspect;
    var bw = 2*aspect;
    this.L = sqrt(2.0*2.0 + bw*bw); // a period of the slant image
    this.h = 2.0*bw / this.L;            // height of the slant image
    this.offset = (this.L-sqrt(this.L*this.L-4*this.h*this.h))/2.0;
      //printf("%f %f %f\n", L,h,offset);
    this.e1x = 2.0/this.L;
    this.e1y = bw/this.L;
    this.e2x = -bw/this.L;
    this.e2y = 2.0/this.L;
  }
  func(dst){
    var dstx = dst.re;
    var dsty = dst.im;
    var sx = dstx*this.e1x + dsty*this.e1y;
    var sy = dstx*this.e2x + dsty*this.e2y;
    var dy = floor( sy / this.h + 0.5 );
    sy -= this.h*dy;
    sx += (this.L - this.offset)*dy;
    sx = sx / this.h * this.aspect * 2.0;
    sy = sy / this.h * this.aspect * 2.0;
    sx -= floor( sx/2.0 + 0.5 )*2.0;
    return math.complex(sx, sy);
  }
};


function solidpixel(img, x, y){
    return img.get(int(x),int(y));
}

function interpolate(img, x, y){
    if ( (x > img.width - 1) || ( y > img.height -1 ) ){
	return solidpixel(img,x,y);
    }
    let p00 = img.get(int(x), int(y));
    let p01 = img.get(int(x), int(y+1));
    let p10 = img.get(int(x+1), int(y));
    let p11 = img.get(int(x+1), int(y+1));
    var dx = x - int(x);
    var dy = y - int(y);
    let lx0 = lerpColor(color(p00), color(p10), dx);
    let lx1 = lerpColor(color(p01), color(p11), dx);
    return lerpColor(lx0, lx1, dy);
}



function projection(img, pixels, projfunc, pixelfunc=solidpixel)
{
    img.loadPixels();
    var w = img.width;
    var h = img.height;
    
    var canvas = new p5.Image(pixels, pixels);
    canvas.loadPixels();
    
    background(220);
    // scale w to 1
    var aspect = h / w * 2;
    //console.log(aspect,w,h);
    var wh = w / 2;
    let x,y,d;
    for (y = 0; y < pixels; y++) {
	var im = (y - pixels/2) / (pixels/2);
	for (x = 0; x < pixels; x++) {
	    var re = (x - (pixels/2)) / (pixels/2);
	    const v = math.complex(re, im);
	    const t = projfunc(v); //math.multiply(math.log(v), 1/6.28);//v.inverse();
	    var sre = t.re;
	    var sim = t.im;
	    sre -= floor(sre / 2.0 + 0.5) * 2.0;
	    sim -= floor(sim / aspect + 0.5) * aspect;
	    const sx = (sre * wh + wh);
	    const sy = (sim * wh + h / 2);
	    if ((0 <= sx) && (sx < w) && (0 <= sy) && (sy < h)) {
		canvas.set(x,y, pixelfunc(img, sx,sy));
	    }
	}
    }
    canvas.updatePixels();
    return canvas;  
}


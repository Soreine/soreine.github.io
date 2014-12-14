float angle, radius, lx, ly, sz = 5;
int num = 80;
PVector[] dots = new PVector[num];
PVector[] endPos = new PVector[num];
final int NB_FRAME = 60;

void setup() {
  size(300, 300);
  background(-1);
  strokeWeight(3);
  strokeJoin(ROUND);
  radius = min(width*.4, height*.4);
  ellipseMode(CENTER);

  // Init starting points
  initShape();

  // Init end points
  for (int i=0; i<num; i++) {
    float px = width/2 + sin(angle)*radius;
    float py = height/2 + cos(angle)*radius;
    endPos[i]= new PVector(px, py);
    angle+=TWO_PI/num;
  }
}

void draw() {
  // Draw white at 20%
  noStroke();
  fill(-1, 14);
  rect(0, 0, width, height);

  // Draw the Shape
  noFill();
  stroke(255 - constrain(frameCount%NB_FRAME, 0, 30)*2);
  beginShape();
  for (int i=0; i<num; i++) {
    dots[i].x = lerp(dots[i].x, endPos[i].x, 0.1);
    dots[i].y = lerp(dots[i].y, endPos[i].y, 0.1);
    vertex(dots[i].x, dots[i].y);
  }
  endShape(CLOSE);
  if (frameCount%NB_FRAME==0) {
    initShape();
  }

  
  // Draw the circle
  stroke(255);
  noFill();
  ellipse(width/2, height/2, 2*radius, 2*radius);
  noStroke();
}


void initShape() {
        for (int i=0; i<num; i++) {
            float x = random(width*.33, width*.66);
            float y = random(height*.33, height*.66);
            dots[i]= new PVector(x, y);
        }
}

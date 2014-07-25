float angle, radius, lx, ly, sz = 5;
int num = 100;
PVector[] dots = new PVector[num];
PVector[] endPos = new PVector[num];
final int NB_FRAME = 60;

void setup() {
  size(300, 300);
  background(-1);
  fill(#A0FF1C);
  noFill();
  stroke(#A0FF1C);
  strokeWeight(3);
  strokeJoin(ROUND);
  radius = min(width*.4, height*.4);

  for (int i=0; i<num; i++) {
    float x = random(width*.33, width*.66);
    float y = random(height*.33, height*.66);
    dots[i]= new PVector(x, y);
  }

  for (int i=0; i<num; i++) {
    float px = width/2 + sin(angle)*radius;
    float py = height/2 + cos(angle)*radius;
    endPos[i]= new PVector(px, py);
    angle+=TWO_PI/num;
  }
}

void draw() {
  fill(-1, 20);
  noStroke();
  rect(0, 0, width, height);
  noFill();
  stroke(255 - constrain(frameCount%NB_FRAME, 0, 20)*3);
  beginShape();
  for (int i=0; i<num; i++) {
    dots[i].x = lerp(dots[i].x, endPos[i].x, 0.1);
    dots[i].y = lerp(dots[i].y, endPos[i].y, 0.1);
    if (i==0) vertex(dots[i].x, dots[i].y);
    vertex(dots[i].x, dots[i].y);
    if (i==num-1) vertex(dots[i].x, dots[i].y);
  }
  endShape(CLOSE);
  if (frameCount%NB_FRAME==0) {
    for (int i=0; i<num; i++) {
      float x = random(width*.33, width*.66);
      float y = random(height*.33, height*.66);
      dots[i]= new PVector(x, y);
    }
  }
}



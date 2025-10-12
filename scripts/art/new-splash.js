var TWO_PI = Math.PI * 2;
var canvas, ctx;

var HEIGHT;
var WIDTH;
var WCENTER;
var HCENTER;

// float
var angle = 0;
var radius;
// Arrays
var dots;
var endPos = [];
var NUM = 200;

var frame = 0;
var NB_FRAME = 75;

function getLineWidth(frame) {
    var progress = (frame % NB_FRAME) / NB_FRAME;
    return (1 - Math.sqrt(progress)) * 20;
}

function setup() {
    ctx.lineJoin = 'round';

    radius = Math.min(WIDTH * 0.4, HEIGHT * 0.4);

    initEnd();
}

function loop() {
    // Blur effect
    clear(0.2);
    draw(frame);
    frame++;
    window.requestAnimationFrame(loop);
}

function draw(frame) {
    if (frame % NB_FRAME === 0) {
        initShape();
    }
    ctx.lineWidth = getLineWidth(frame);

    // Draw the Shape
    for (var i = 0; i < NUM; ++i) {
        dots[i].x = lerp(dots[i].x, endPos[i].x, 0.1);
        dots[i].y = lerp(dots[i].y, endPos[i].y, 0.1);
    }
    path(ctx, function() {
        ctx.strokeStyle = gray(
            255 - Math.floor(constrain(frame % NB_FRAME, 0, 30) * 1.5)
        );
        shape(ctx, dots);
        ctx.stroke();
    });

    // Draw the circle
    path(ctx, function() {
        ctx.lineWidth = getLineWidth(frame) + 1;
        ctx.strokeStyle = gray(255);
        circle(ctx, WCENTER, HCENTER, radius);
        ctx.stroke();
    });
}

function initShape() {
    // Init start position
    dots = [];
    var maxR = radius * 0.66;
    for (var i = 0; i < NUM; ++i) {
        // Random inside a circle
        // http://www.anderswallin.net/2009/05/uniform-random-points-in-a-circle-using-polar-coordinates/
        var r = maxR * Math.sqrt(Math.random());
        var angle = TWO_PI * Math.random();
        dots.push({
            x: WCENTER + 0.4 * r * Math.cos(angle),
            y: HCENTER + 0.4 * r * Math.sin(angle)
        });
    }
}

function initEnd() {
    // Init end position
    for (var i = 0; i < NUM; ++i) {
        endPos.push({
            x: WCENTER + Math.sin(angle) * radius,
            y: HCENTER + Math.cos(angle) * radius
        });
        angle += TWO_PI / NUM;
    }
}

function clear(alpha) {
    ctx.fillStyle = gray(255, alpha);
    ctx.fillRect(0, 0, WIDTH, HEIGHT);
}

function main(ref) {
    canvas = document.getElementById(ref);
    if (canvas.getContext) {
        ctx = canvas.getContext('2d');

        HEIGHT = canvas.height;
        WIDTH = canvas.width;
        WCENTER = WIDTH / 2;
        HCENTER = HEIGHT / 2;

        setup();

        window.requestAnimationFrame(loop);
    }
}

window.onload = main.bind(this, 'canvas');

// UTILS

function gray(v, alpha) {
    alpha = alpha || 1;
    return 'rgba(' + v + ',' + v + ',' + v + ',' + alpha + ')';
}

function shape(ctx, vertices) {
    if (vertices.length > 0) {
        ctx.moveTo(vertices[0].x, vertices[0].y);
    }

    for (var i = 1; i < vertices.length; ++i) {
        ctx.lineTo(vertices[i].x, vertices[i].y);
    }

    if (vertices.length > 0) {
        ctx.lineTo(vertices[0].x, vertices[0].y);
    }
}

function constrain(x, min, max) {
    if (x < min) {
        return min;
    } else if (x > max) {
        return max;
    } else {
        return x;
    }
}

function circle(ctx, x, y, radius) {
    ctx.arc(x, y, radius, 0, TWO_PI, false);
}

function lerp(min, max, amount) {
    return (max - min) * amount + min;
}

function path(ctx, fun) {
    ctx.beginPath();
    fun();
    ctx.closePath();
}

//import { text } from "express";

const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
console.log("context of canvas:", ctx);

const signature = document.getElementById("signature");
//SHOULD IT ⬆︎ BE CONST OR LET???

console.log("signature: ", signature);
let isDrawing = false;
let x = 0;
let y = 0;

canvas.addEventListener("mousedown", (e) => {
    console.log("mouse is down");
    x = e.offsetX;
    y = e.offsetY;
    isDrawing = true;
});

canvas.addEventListener("mousemove", (e) => {
    if (isDrawing === true) {
        drawLine(ctx, x, y, e.offsetX, e.offsetY);
        x = e.offsetX;
        y = e.offsetY;
    }
});

canvas.addEventListener("mouseup", (e) => {
    if (isDrawing === true) {
        drawLine(ctx, x, y, e.offsetX, e.offsetY);
        x = 0;
        y = 0;
        isDrawing = false;
        signature.value = canvas.toDataURL();
    }
});

function drawLine(ctx, x1, y1, x2, y2) {
    ctx.beginPath();
    // ctx.lineWidth = 2;
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
    ctx.closePath();
}

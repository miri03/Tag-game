const imageR1 = new Image()
const imageL1 = new Image()
const imageR2 = new Image()
const imageL2 = new Image()
const background = new Image()
const platform = new Image()

background.src = "/static/assets/back.jpg"
platform.src = "/static/assets/platform.png"
const imageIR1 = []
const imageIL1 = []

const imageIR2 = []
const imageIL2 = []

const arrow = new Image()
arrow.src = "/static/assets/tagger.png"
const go_arrow = new Image()
go_arrow.src = "/static/assets/GO.png"

imageR1.src = "/static/assets/red_box_right.png"
imageL1.src = "/static/assets/red_box_left.png"
imageIL1.src = "/static/assets/red_box_IdleL.png"

imageR2.src = "/static/assets/blue_box_right.png"
imageL2.src = "/static/assets/blue_box_left.png"
imageIL2.src = "/static/assets/blue_box_IdleL.png"

let pathR = ["/static/assets/red_box_IdleR1.png", "/static/assets/red_box_IdleR2.png", "/static/assets/red_box_IdleR.png"]
let pathL = ["/static/assets/red_box_IdleL1.png", "/static/assets/red_box_IdleL2.png", "/static/assets/red_box_IdleL.png"]

let pathR2 = ["/static/assets/blue_box_IdleR1.png", "/static/assets/blue_box_IdleR2.png", "/static/assets/blue_box_IdleR.png"]
let pathL2 = ["/static/assets/blue_box_IdleL1.png", "/static/assets/blue_box_IdleL2.png", "/static/assets/blue_box_IdleL.png"]

for (let i = 0; i < 3; i++)
{
    imageIR1[i] = new Image()
    imageIR1[i].src = pathR[i]

    imageIL1[i] = new Image()
    imageIL1[i].src = pathL[i]

    imageIR2[i] = new Image()
    imageIR2[i].src = pathR2[i]
    
    imageIL2[i] = new Image()
    imageIL2[i].src = pathL2[i]
}

const numbers = []
let pathN = ["/static/assets/num0.png", "/static/assets/num1.png", "/static/assets/num2.png", "/static/assets/num3.png", "/static/assets/num4.png", "/static/assets/num5.png", "/static/assets/num6.png", "/static/assets/num7.png", "/static/assets/num8.png", "/static/assets/num9.png"]

for (let i = 0; i < 10; i++)
{
    numbers[i] = new Image()
    numbers[i].src = pathN[i]
}

export {imageR1, imageL1, imageIR1, imageIL1, imageR2, imageL2, imageIR2, imageIL2, arrow, go_arrow, numbers, background, platform}
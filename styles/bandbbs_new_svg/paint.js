class SmoothCorner {

  // inputProperties returns a list of CSS properties that this paint function gets access to
  
  static get inputProperties() { return ['--smooth-level']; }

  paint(ctx, size, properties) {
    ctx.fillStyle = 'black'
    const level = properties.get('--smooth-level').toString()
    const n = level

    let m = n
    if (n > 100) m = 100
    if (n < 0.00000000001) m = 0.00000000001
    let padding = -0.14*m+9.4
    let r = size.width / 2
    let w = size.width / 2
    let h = size.height / 2
    if (size.width < size.height) {
      r = size.height / 2
      w = size.width / 2 + (size.width - size.height) / 2
    } else {
      h = size.height / 2 + (size.height - size.width) / 2
    }
    

    ctx.beginPath();

    for (let i = 0; i < (2*r + 1); i++) {
      const x = (i-r) + w
      const y = (Math.pow(Math.abs(Math.pow(r,m)-Math.pow(Math.abs(i-r),m)),1/m)) + h

      if (i == 0)
        ctx.moveTo(x, y)
      else
        ctx.lineTo(x, y)
    }

    if (size.width < size.height) {
      w = size.height / 2
    } else {
      h = size.width / 2
    }
    

    for (let i = (2*r); i < (4*r + 1); i++) {
      const x = (3*r-i) + w
      const y = (-Math.pow(Math.abs(Math.pow(r,m)-Math.pow(Math.abs(3*r-i),m)),1/m)) + h
      ctx.lineTo(x, y)
    }

    ctx.closePath()
    ctx.fill()
  } 
}

registerPaint('smooth-corners', SmoothCorner);
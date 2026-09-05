// Original hand-drawn letter paths, preserved from js/fireplay.js.
const fireDelta = 50;
const LetterFire = {};
function Point3D(X, Y, Z) {
  this.X = X;
  this.Y = Y;
  this.Z = Z;
}
LetterFire["0"] = getArcFires(
  new Point3D(0, 0, 0),
  -Math.PI * 0.5,
  1.5 * Math.PI,
  300,
  true,
);
LetterFire["1"] = getLineFires(
  new Point3D(-40, -160, 0),
  new Point3D(0, -200, 0),
)
  .concat(getLineFires(new Point3D(0, -200, 0), new Point3D(0, 300, 0)))
  .concat(getLineFires(new Point3D(-40, 300, 30), new Point3D(60, 300, 30)));
LetterFire["2"] = getArcFires(
  new Point3D(0, -100, 0),
  0,
  1.25 * Math.PI,
  200,
  true,
)
  .concat(getLineFires(new Point3D(200, -100, 0), new Point3D(-200, 250, 0)))
  .concat(getLineFires(new Point3D(-200, 250, 0), new Point3D(200, 250, 0)));
LetterFire["3"] = getArcFires(
  new Point3D(0, -100, 0),
  0,
  1.25 * Math.PI,
  200,
  true,
)
  .concat(getLineFires(new Point3D(200, -100, 0), new Point3D(0, 0, 0)))
  .concat(getLineFires(new Point3D(0, 0, 0), new Point3D(200, 100, 0)))
  .concat(
    getArcFires(new Point3D(0, 100, 0), 1.25 * Math.PI, 2 * Math.PI, 200, true),
  );
LetterFire["4"] = getLineFires(new Point3D(0, -300, 0), new Point3D(-200, 0, 0))
  .concat(getLineFires(new Point3D(-200, 0, 0), new Point3D(200, 0, 0)))
  .concat(getLineFires(new Point3D(0, -300, 0), new Point3D(0, 300, 0)));
LetterFire["5"] = getLineFires(
  new Point3D(-200, -200, 0),
  new Point3D(200, -200, 0),
)
  .concat(getLineFires(new Point3D(-200, -200, 0), new Point3D(-200, 0, 0)))
  .concat(
    getArcFires(
      new Point3D(-50, 80.603, 0),
      Math.PI * 2.9652,
      Math.PI * 4.9012,
      173.205,
      true,
    ),
  );
LetterFire["6"] = getArcFires(new Point3D(0, 0, 0), 0, Math.PI, 200, false)
  .concat(
    getArcFires(new Point3D(100, 0, 0), Math.PI, 1.5 * Math.PI, 300, false),
  )
  .concat(
    getArcFires(
      new Point3D(100, 200, 0),
      Math.PI * 1.5,
      Math.PI * 2,
      100,
      false,
    ),
  )
  .concat(getArcFires(new Point3D(0, 200, 0), 0, Math.PI * 0.9, 200, false));
LetterFire["7"] = getLineFires(
  new Point3D(-200, -200, 0),
  new Point3D(200, -200, 0),
).concat(getLineFires(new Point3D(200, -200, 0), new Point3D(-200, 400, 0)));
LetterFire["8"] = getArcFires(
  new Point3D(0, -150, 0),
  -Math.PI * 0.5,
  Math.PI * 1.5,
  150,
  true,
).concat(
  getArcFires(new Point3D(0, 200, 0), Math.PI * 0.5, Math.PI * 2.5, 200, false),
);
LetterFire["9"] = getArcFires(
  new Point3D(0, -200, 0),
  Math.PI,
  1.9 * Math.PI,
  200,
  true,
)
  .concat(
    getArcFires(new Point3D(-100, -200, 0), Math.PI * 0.5, Math.PI, 100, true),
  )
  .concat(getArcFires(new Point3D(-100, 0, 0), 0, Math.PI * 0.5, 300, true))
  .concat(getArcFires(new Point3D(-50, 0, 0), Math.PI, Math.PI * 2, 250, true));
LetterFire["A"] = getLineFires(
  new Point3D(-200, 175, 30),
  new Point3D(0, -400, -60),
)
  .concat(getLineFires(new Point3D(0, -400, -60), new Point3D(200, 175, 40)))
  .concat(getLineFires(new Point3D(-150, 0, 0), new Point3D(150, 0, 0)));
LetterFire["B"] = getLineFires(
  new Point3D(-200, -200, 30),
  new Point3D(-200, 200, 0),
)
  .concat(getLineFires(new Point3D(-200, -200, 0), new Point3D(0, -200, 20)))
  .concat(
    getArcFires(new Point3D(0, -100, 0), -Math.PI / 2, Math.PI / 2, 100, true),
  )
  .concat(getLineFires(new Point3D(0, 0, 0), new Point3D(-200, 0, 0)))
  .concat(
    getArcFires(new Point3D(0, 100, 0), -Math.PI / 2, Math.PI / 2, 100, true),
  )
  .concat(getLineFires(new Point3D(0, 200, 0), new Point3D(-200, 200, 30)));
LetterFire["C"] = getArcFires(
  new Point3D(0, 0, 0),
  Math.PI / 4,
  1.8 * Math.PI,
  200,
);
LetterFire["D"] = getLineFires(
  new Point3D(-100, -200, 30),
  new Point3D(-100, 200, 0),
)
  .concat(getLineFires(new Point3D(-100, -200, 0), new Point3D(0, -200, 20)))
  .concat(
    getArcFires(new Point3D(0, 0, 0), -Math.PI / 2, Math.PI / 2, 200, true),
  )
  .concat(getLineFires(new Point3D(0, 200, 0), new Point3D(-100, 200, 30)));
LetterFire["E"] = getLineFires(
  new Point3D(-100, -200, 30),
  new Point3D(-100, 200, 0),
)
  .concat(getLineFires(new Point3D(-100, -200, 0), new Point3D(200, -200, 20)))
  .concat(getLineFires(new Point3D(-100, 0, 0), new Point3D(200, 0, 20)))
  .concat(getLineFires(new Point3D(-100, 200, 0), new Point3D(200, 200, 30)));
LetterFire["F"] = getLineFires(
  new Point3D(-100, -200, 30),
  new Point3D(-100, 200, 0),
)
  .concat(getLineFires(new Point3D(-100, -200, 0), new Point3D(200, -200, 20)))
  .concat(getLineFires(new Point3D(-100, 0, 0), new Point3D(200, 0, 20)));
LetterFire["G"] = getArcFires(
  new Point3D(0, 0, 0),
  Math.PI / 4,
  1.8 * Math.PI,
  200,
)
  .concat(getLineFires(new Point3D(50, 0, 0), new Point3D(250, 0, 0)))
  .concat(getLineFires(new Point3D(200, 0, 0), new Point3D(200, 240, 0)));
LetterFire["H"] = getLineFires(
  new Point3D(-100, -200, 30),
  new Point3D(-100, 200, 0),
)
  .concat(getLineFires(new Point3D(-100, 0, 0), new Point3D(200, 0, 20)))
  .concat(getLineFires(new Point3D(100, -200, 0), new Point3D(100, 200, 30)));
LetterFire["I"] = getLineFires(
  new Point3D(-50, -200, 30),
  new Point3D(50, -200, 0),
)
  .concat(getLineFires(new Point3D(0, -200, 30), new Point3D(0, 200, 0)))
  .concat(getLineFires(new Point3D(-50, 200, 30), new Point3D(50, 200, 0)));
LetterFire["J"] = getLineFires(
  new Point3D(-50, -200, 30),
  new Point3D(50, -200, 0),
)
  .concat(getLineFires(new Point3D(0, -200, 30), new Point3D(0, 150, 0)))
  .concat(
    getArcFires(new Point3D(-75, 150, 30), Math.PI, 2 * Math.PI, 75, true),
  );

LetterFire["K"] = getLineFires(
  new Point3D(-100, -200, 30),
  new Point3D(-100, 200, 0),
)
  .concat(getLineFires(new Point3D(-100, 0, 0), new Point3D(200, -200, 20)))
  .concat(getLineFires(new Point3D(-100, 0, 0), new Point3D(200, 200, 20)));

LetterFire["L"] = getLineFires(
  new Point3D(-100, -200, 30),
  new Point3D(-100, 200, 0),
).concat(getLineFires(new Point3D(-100, 200, 0), new Point3D(200, 200, 30)));
LetterFire["M"] = getLineFires(
  new Point3D(-150, 200, 0),
  new Point3D(-150, -150, 0),
)
  .concat(getLineFires(new Point3D(-150, -150, 0), new Point3D(0, 0, 0)))
  .concat(getLineFires(new Point3D(0, 0, 0), new Point3D(150, -150, 0)))
  .concat(getLineFires(new Point3D(150, -150, 0), new Point3D(150, 200, 0)));
LetterFire["N"] = getLineFires(
  new Point3D(-150, -150, 0),
  new Point3D(-150, 200, 0),
)
  .concat(getLineFires(new Point3D(-150, -150, 0), new Point3D(150, 200, 0)))
  .concat(getLineFires(new Point3D(150, 200, 0), new Point3D(150, -200, 0)));
LetterFire["O"] = getArcFires(
  new Point3D(0, 0, 0),
  -Math.PI * 0.5,
  Math.PI * 1.5,
  200,
  true,
);
LetterFire["P"] = getLineFires(
  new Point3D(-100, -200, 0),
  new Point3D(-100, 200, 0),
)
  .concat(getLineFires(new Point3D(-100, -200, 0), new Point3D(100, -200, 0)))
  .concat(
    getArcFires(
      new Point3D(100, -100, 0),
      -0.5 * Math.PI,
      0.5 * Math.PI,
      100,
      true,
    ),
  )
  .concat(getLineFires(new Point3D(100, 0, 0), new Point3D(-100, 0, 0)));
LetterFire["Q"] = getArcFires(
  new Point3D(0, 0, 0),
  -Math.PI * 0.5,
  Math.PI * 1.5,
  200,
  true,
).concat(getLineFires(new Point3D(50, 50, 0), new Point3D(250, 250, 0)));
LetterFire["R"] = getLineFires(
  new Point3D(-100, -200, 0),
  new Point3D(-100, 200, 0),
)
  .concat(getLineFires(new Point3D(-100, -200, 0), new Point3D(100, -200, 0)))
  .concat(
    getArcFires(
      new Point3D(100, -100, 0),
      -0.5 * Math.PI,
      0.5 * Math.PI,
      100,
      true,
    ),
  )
  .concat(getLineFires(new Point3D(100, 0, 0), new Point3D(-100, 0, 0)))
  .concat(getLineFires(new Point3D(-100, 0, 0), new Point3D(250, 250, 0)));
LetterFire["S"] = getArcFires(
  new Point3D(0, -100, 0),
  -Math.PI * 0.2,
  Math.PI,
  150,
  false,
)
  .concat(getLineFires(new Point3D(-150, -100, 0), new Point3D(150, 100, 0)))
  .concat(
    getArcFires(new Point3D(0, 100, 0), 0.8 * Math.PI, 2 * Math.PI, 150, true),
  );
LetterFire["T"] = getLineFires(
  new Point3D(-150, -200, 0),
  new Point3D(150, -200, 0),
).concat(getLineFires(new Point3D(0, -200, 0), new Point3D(0, 200, 0)));
LetterFire["U"] = getLineFires(
  new Point3D(-150, -150, 0),
  new Point3D(-150, 0, 0),
)
  .concat(getArcFires(new Point3D(0, 0, 0), Math.PI, Math.PI * 2, 150, false))
  .concat(getLineFires(new Point3D(150, 0, 0), new Point3D(150, -150, 0)));
LetterFire["V"] = getLineFires(
  new Point3D(-150, -150, 0),
  new Point3D(0, 200, 0),
).concat(getLineFires(new Point3D(0, 200, 0), new Point3D(150, -150, 0)));
LetterFire["W"] = getLineFires(
  new Point3D(-150, -150, 0),
  new Point3D(-75, 200, 0),
)
  .concat(getLineFires(new Point3D(-75, 200, 0), new Point3D(0, -150, 0)))
  .concat(getLineFires(new Point3D(0, -150, 0), new Point3D(75, 200, 0)))
  .concat(getLineFires(new Point3D(75, 200, 0), new Point3D(150, -150, 0)));
LetterFire["X"] = getLineFires(
  new Point3D(-200, -200, 0),
  new Point3D(200, 200, 0),
).concat(getLineFires(new Point3D(200, -200, 0), new Point3D(-200, 200, 0)));
LetterFire["Y"] = getLineFires(new Point3D(-150, -150, 0), new Point3D(0, 0, 0))
  .concat(getLineFires(new Point3D(150, -150, 0), new Point3D(0, 0, 0)))
  .concat(getLineFires(new Point3D(0, 0, 0), new Point3D(0, 300, 0)));
LetterFire["Z"] = getLineFires(
  new Point3D(-200, -200, 0),
  new Point3D(200, -200, 0),
)
  .concat(getLineFires(new Point3D(200, -200, 0), new Point3D(-200, 200, 0)))
  .concat(getLineFires(new Point3D(-200, 200, 0), new Point3D(200, 200, 0)));

LetterFire[" "] = [];
function getDist(st, fi) {
  return Math.sqrt(
    Math.pow(st.X - fi.X, 2) +
      Math.pow(st.Y - fi.Y, 2) +
      Math.pow(st.Z - fi.Z, 2),
  );
}
function getUnitVect(st, fi) {
  var d = getDist(st, fi);
  return new Point3D(
    (fireDelta * (fi.X - st.X)) / d,
    (fireDelta * (fi.Y - st.Y)) / d,
    (fireDelta * (fi.Z - st.Z)) / d,
  );
}
function getLineFires(st, fi) {
  var tmpPoint = [];
  var dv = getUnitVect(st, fi);
  var n = getDist(st, fi) / fireDelta;
  var i;
  for (i = 0; i < n; i++) {
    tmpPoint = tmpPoint.concat(
      new Point3D(st.X + i * dv.X, st.Y + i * dv.Y, st.Z + i * dv.Z),
    );
  }
  return tmpPoint;
}
function getArcFires(org, st, fi, rad, clcwis) {
  var tmpPoint = [];
  var dt = fireDelta / rad;
  var i;
  var n = (fi - st) / dt;
  var tx, ty;
  if (clcwis == true) {
    dt = -dt;
    var tp = st;
    st = fi;
    fi = tp;
  }
  for (i = 0; i < n; i++) {
    tx = Math.cos(st + dt * i) * rad;
    ty = -Math.sin(st + dt * i) * rad;
    tmpPoint = tmpPoint.concat(new Point3D(org.X + tx, org.Y + ty, org.Z));
  }
  return tmpPoint;
}

export { LetterFire };

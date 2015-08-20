var FPS = 600;

var frame_time_ms = 1000.0 / FPS;

var count = 0;

function drawRect(ctx, x, y, w, h, s) {
  ctx.fillStyle = s;
  ctx.fillRect(x, y, w, h);
}

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min)) + min;
}

//-----------------------------------------------------------------------------
// Sort visualisation
//-----------------------------------------------------------------------------
  var MAX_VALUE = 100;

  var g_State = {
    array: [],
    colors: [],
  };

  var operations = [];

  function addOp(op) {
    op.state = g_State;
    operations.push(op);
    op.step();
    op.poststep();
  }

  var KEY_LEFT = 37;
  var KEY_RIGHT = 39;

  var prevStep = -1;

  function stepForward() {
    if (prevStep >= 0 && prevStep < operations.length - 1) {
      operations[prevStep].poststep();
      operations[prevStep + 1].step();
      prevStep ++;
    }
  }

  function stepBack() {
    if (prevStep > 0 && prevStep < operations.length) {
      operations[prevStep].poststep();
      operations[prevStep].stepback();
      operations[prevStep].poststep();
      operations[prevStep - 1].stepback();
      operations[prevStep - 1].poststep();
      operations[prevStep - 1].step();
      prevStep --;
    }
  }

  var scroll = 0;

  function keyDown(e) {
    if (e.ctrlKey) {
      if (e.keyCode == KEY_LEFT) {
        scroll = 2;
      }
      if (e.keyCode == KEY_RIGHT) {
        scroll = 1;
      }
    }
    else {
      if (e.keyCode == KEY_RIGHT) {
        stepForward();
      }
      if (e.keyCode == KEY_LEFT) {
        stepBack();
      }
    }
  }

  function keyUp(e) {
    if (e.keyCode == KEY_RIGHT || e.keyCode == KEY_LEFT) {
      scroll = 0;
    }
  }

  function renderFrame(ctx) {
    if (scroll == 1)
      stepForward();
    if (scroll == 2)
      stepBack();

    var width = ctx.canvas.width;
    var height = ctx.canvas.height;
    drawRect(ctx, 0, 0, width, height, "#7F7F7F");

    var gap = 1;
    var rectw = Math.floor((width - g_State.array.length * gap - 10) / g_State.array.length);
    var recth = Math.max(1, Math.min(height - 2, 300));
    var recty = Math.max(1 + recth, Math.floor(height / 2));

    var curx = Math.floor((width - (rectw + gap) * g_State.array.length) / 2);
    for (i = 0; i < g_State.array.length; i ++) {
      h = g_State.array[i] / 100 * recth;
      drawRect(ctx, curx, recty - h, rectw, h, g_State.colors[i]);
      curx += rectw + gap;
    }
  }

  function visualise() {
    g_State.array = [];
    g_State.colors = [];
    operations[0].step();
    prevStep = 0;
  }

  //-----------------------------------------------------------------------------
  // OpNull
  //-----------------------------------------------------------------------------
    function OpNull() {
    }

    OpNull.prototype.drawElem = function(ctx, x, y, w, h, s) {
      drawRect(ctx, x, y, w, h, s);
    }

  //-----------------------------------------------------------------------------
  // Op Create Array
  //-----------------------------------------------------------------------------
    OpCreateArray.prototype = new OpNull();
    OpCreateArray.prototype.constructor = OpCreateArray;
    function OpCreateArray(size) {
      this.size = size;
      this.array = new Array(size);
      for (i = 0; i < size; i ++) {
        this.array[i] = getRandomInt(1, MAX_VALUE);
      }
    }

    OpCreateArray.prototype.step = function() {
      this.state.colors = new Array(this.size);
      for (i = 0; i < this.size; i ++) {
        this.state.array[i] = this.array[i];
        this.state.colors[i] = "#FFFFFF";
      }
    }

    OpCreateArray.prototype.stepback = function() {
    }

    OpCreateArray.prototype.poststep = function() {
    }

    function createRandomArray(size) {
      addOp (new OpCreateArray(size));
    }

  //-----------------------------------------------------------------------------
  // Op Swap Values
  //-----------------------------------------------------------------------------
    OpSwapValues.prototype = new OpNull();
    OpSwapValues.prototype.constructor = OpSwapValues;
    function OpSwapValues(index1, index2) {
      this.index1 = index1;
      this.index2 = index2;
    }

    OpSwapValues.prototype.step = function() {
      var t = this.state.array[this.index1];
      this.state.array[this.index1] = this.state.array[this.index2];
      this.state.array[this.index2] = t;
      this.state.colors[this.index1] = "#FF0000";
      this.state.colors[this.index2] = "#FF0000";
    }

    OpSwapValues.prototype.stepback = OpSwapValues.prototype.step;

    OpSwapValues.prototype.poststep = function() {
      this.state.colors[this.index1] = "#FFFFFF";
      this.state.colors[this.index2] = "#FFFFFF";
    }

    function swapValues(index1, index2) {
      addOp (new OpSwapValues(index1, index2));
    }

  //-----------------------------------------------------------------------------
  // Op Get Value
  //-----------------------------------------------------------------------------
    OpGetValue.prototype = new OpNull();
    OpGetValue.prototype.constructor = OpGetValue;
    function OpGetValue(index) {
      this.index = index;
    }

    OpGetValue.prototype.step = function() {
      this.state.colors[this.index] = "#00FF00";
    }

    OpGetValue.prototype.stepback = OpGetValue.prototype.step;

    OpGetValue.prototype.poststep = function() {
      this.state.colors[this.index] = "#FFFFFF";
    }

    function getValue(index) {
      addOp (new OpGetValue(index));
      return g_State.array[index];
    }

//-----------------------------------------------------------------------------

function registerKeypresses(handler) {
  var c = document.getElementById("cc");
  c.addEventListener("keydown", keyDown);
  c.addEventListener("keyup", keyUp);
}

var registered = false;

function doFrame() {
  var c = document.getElementById("cc");
  if (c) {
    if (!registered) {
      registered = true;
      registerKeypresses();
    }
    var ctx = c.getContext("2d");
    ctx.canvas.width  = window.innerWidth;
    ctx.canvas.height = window.innerHeight;

    renderFrame(ctx);
  }
  prepareNextFrame();
}

function prepareNextFrame() {
  var now = Date.now();
  var spare_time = Math.max(1, frame_timestamp + frame_time_ms - now);

  frame_timestamp += now - frame_timestamp + spare_time;

  setTimeout(doFrame, Math.round(spare_time));
}

//-----------------------------------------------------------------------------

var frame_timestamp = Date.now();
prepareNextFrame();


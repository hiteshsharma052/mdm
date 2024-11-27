// Splitter
// A function is used for dragging and moving
function dragElement(element, direction) {
    var md; // remember mouse down info
    const first = document.getElementById("first");
    const second = document.getElementById("second");
  
    element.onmousedown = onMouseDown;
  
    function onMouseDown(e) {
      //console.log("mouse down: " + e.clientX);
      md = {
        e,
        offsetLeft: element.offsetLeft,
        offsetTop: element.offsetTop,
        firstHeight: first.offsetHeight,
        secondHeight: second.offsetHeight
      };
  
      document.onmousemove = onMouseMove;
      document.onmouseup = () => {
        //console.log("mouse up");
        document.onmousemove = document.onmouseup = null;
      }
    }
  
    function onMouseMove(e) {
      //console.log("mouse move: " + e.clientX);
      var delta = {
        x: e.clientX - md.e.clientX,
        y: e.clientY - md.e.clientY
      };
  
      if (direction === "V") // Vertical
      {        
        // Prevent negative-sized elements
        delta.x = Math.min(Math.max(delta.y, -md.firstHeight),
          md.secondHeight);
  
        element.style.top = md.offsetTop + delta.x + "px";
        first.style.height = (md.firstHeight + delta.x) + "px";
        second.style.height = (md.secondHeight - delta.x) + "px";
      }
    }
  }
  dragElement(document.getElementById("separator"), "V");
  new PerfectScrollbar('#first', {
    suppressScrollX: true
  });
  new PerfectScrollbar('#second', {
    suppressScrollX: true
  });


  $( document ).ready(function() {

    $('#editor-container').wysihtml5({
        "font-styles": false,
        "emphasis": true,
        "lists": true,
        // "html": false,
        "link": true,
        // "image": true,
        // "color": false,
        // "size":   xs,  
        // "events": {
        //     "change":function(){
        //     }
        // }

    });

        // const ps = new PerfectScrollbar('#scrolling-container', {
        //   suppressScrollX: true
        // });
    });


import "intersection-observer";
import scrollama from "scrollama";
import debounce from "lodash.debounce";
import siteWhitelist from "../gannett-sites.json";

// Scrollama offset, or where the intersection observer is triggered relative to the center of the viewport
const scrollamaOffset = 0.7;

// Scrollama will show a horizontal dashed line at the specified offset *only* during development for debug purposes.
// Uncomment if this harshes your dev experience and you want it disabled now.
// const scrollamaShowDebug = false;

// Cache DOM elements
const $scrollyIframe = document.querySelector("#scrolly-iframe");

/**
 * Send a message to a target element
 * @param {string} msg - Message to be sent
 * @param {element reference} [el] - reference to element to send message to (default: top)
 */
const msgSend = (msg, el = top) => {
  console.log("Sending a message to the parent window");
  el.postMessage(msg, "*");
};

/**
 * Receive a message
 * @param {string} msg
 */
const msgRecv = msg => {
  console.log("Received a message from another window", msg);

  // Killswitch if message origin is not from a trusted source
  if (!siteWhitelist.includes(message.origin)) {
    console.error("SITE NOT ON WHITELIST - HAULTING EXECUTION OF MESSAGE");
    return;
  }
};

const displayMessage = evt => {
  console.log("displayMessage fired");
  console.log(evt);

  var message;
  if (siteWhitelist.indexOf(evt.origin) === -1) {
    top.postMessage("SITE NOT ACCEPTABLE", "*");
  } else {
    if (evt.data == "scrolled") {
      console.console.log(currentSlide);

      //window.parent.addEventListener('scroll', function() {
      if (!!window.IntersectionObserver) {
        console.console.log("creating observer");
        let observer = new IntersectionObserver(
          (entries, observer) => {
            entries.forEach(entry => {
              if (entry.intersectionRatio > 0.97) {
                top.parent.postMessage("SHOULD BE SCROLLING", "*");
                /* document.querySelector('#scrolly').style.position = 'relative';
            document.querySelector('#scrolly').style.overflow = 'scroll';
            document.getElementById(idList[currentSlide]).style.position = 'relative';*/
                document.querySelector(".step").style.left = null;
                document.querySelector(".step").style.marginLeft = null;
              } else {
                //document.querySelector('#scrolly').style.position = 'fixed';
                /*document.getElementById(idList[currentSlide]).style.position = 'fixed';
            document.querySelector('#scrolly').style.overflow = 'hidden';*/
                top.parent.postMessage("SHOULD BE FIXED", "*");
              }
            });
          },
          { rootMargin: "0px" }
        );
        document.querySelectorAll("iframe").forEach(iframe => {
          observer.observe(iframe);
        });

        console.console.log("creating pixel");
        let pixelobserver = new IntersectionObserver(
          (entries, observer) => {
            entries.forEach(entry => {
              if (entry.intersectionRatio == 1) {
                top.parent.postMessage("PIXEL VISIBLE", "*");
              } else {
                top.parent.postMessage("PIXEL NOT VISIBLE", "*");
              }
            });
          },
          { rootMargin: "0px" }
        );
        document.querySelectorAll(".testpixel").forEach(pixeltest => {
          pixelobserver.observe(pixeltest);
        });
      } else document.querySelector("#scrolly").style.position = "relative";
      //});
    }
  }
  /*if(!!window.IntersectionObserver){
    let pixelobserver = new IntersectionObserver((entries, observer) => { 
        entries.forEach(entry => {
            console.console.log(entry);
        if(entry.intersectionRatio > 0.97){
            top.parent.postMessage("PIXEL VISIBLE",'*');
 }
       else {
            top.postMessage('NO PIXEL','*');
        }
        });
    }, {rootMargin: "0px"});
    document.querySelectorAll('.textpixel').forEach(pixel => { pixelobserver.observe(pixel) });
}*/
};
//window.addEventListener("message", displayMessage, false);

// Scrollama event handlers
// response = { element, direction, index }

const handleStepEnter = response => {
  $scrollyIframe.src =
    $scrollyIframe.src.replace(/#slide-.*/, "") + "#slide-" + response.index;
  console.log(
    `Entered step ${response.index}, scroll direction: ${
      response.direction === "down" ? "⬇" : "⬆"
    }`
  );
};

const handleStepExit = response => {
  console.log(
    `Left step ${response.index}, scroll direction: ${
      response.direction === "down" ? "⬇" : "⬆"
    }`
  );
};

/**
 * Init Scrollama
 */
const init = () => {
  const scroller = scrollama();
  scroller
    .setup({
      step: ".step",
      debug:
        typeof scrollamaShowDebug === "undefined"
          ? process.env.NODE_ENV === "development"
          : scrollamaShowDebug,
      offset: scrollamaOffset
    })
    .onStepEnter(handleStepEnter)
    .onStepExit(handleStepExit);

  //Debounce the window resize event so that Scrollama can reinitialize itself properly
  window.addEventListener(
    "resize",
    debounce(() => {
      scroller.resize;
      console.log("Resize event forced re-init of Scrollama");
    }, 300)
  );

  //Receive messages sent from other elements
  window.addEventListener("message", msgRecv, false);
};

// kick things off
init();

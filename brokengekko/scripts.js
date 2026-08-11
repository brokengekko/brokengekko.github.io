var root = 'https://www.brokengekko.com';
var useHash = true;
var hash = '#!';
var router = new Navigo(root, useHash, hash);

// getElementById wrapper
function $id(id) {
  return document.getElementById(id);
}

// asyncrhonously fetch the html template partial from the file directory,
// then set its contents to the html of the parent element
function loadHTML(url, id) {
  req = new XMLHttpRequest();
  req.open('GET', url);
  req.send();
  req.onload = () => {
    $id(id).innerHTML = req.responseText;
  };
}

var default404 = '<h2>Here by default</h2><p><a href="#!/firstroute/" onclick="router.navigate(\'/#!/firstroute/\')">First Route</a></p>';
router.on({
  // 'view' is the id of the div element inside which we render the HTML
  'firstroute': () => { loadHTML('template-first.html', 'view'); },
  'secondroute': () => { loadHTML('./templates/second.html', 'view'); },
  'thirdroute': () => { loadHTML('./templates/third.html', 'view'); },
  '*': () => { $id('view').innerHTML = default404; }
});

// set the default route and 404 routes
router.notFound((query) => { $id('view').innerHTML = default404 + ' Error 404.'; });


router.resolve();

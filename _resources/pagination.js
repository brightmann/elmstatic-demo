document.addEventListener('DOMContentLoaded', function() {
(function() {
  var perPage = 5;
  var list = document.getElementById('post-list');
  if (!list) return;
  var items = Array.prototype.slice.call(list.children);
  var totalPages = Math.ceil(items.length / perPage);
  var pagDiv = document.getElementById('pagination');
  if (!pagDiv || totalPages <= 1) return;
  function render(page) {
    items.forEach(function(el, i) {
      el.style.display = (Math.floor(i / perPage) + 1 === page) ? '' : 'none';
    });
    pagDiv.innerHTML = '';
    function btn(label, target, disabled, active) {
      var b = document.createElement('button');
      b.textContent = label;
      b.disabled = !!disabled;
      if (active) b.className = 'active';
      if (!disabled) b.onclick = function() { render(target); window.scrollTo(0, 0); };
      pagDiv.appendChild(b);
    }
    btn('Previous', page - 1, page === 1);
    for (var p = 1; p <= totalPages; p++) {
      if (totalPages > 7 && p > 2 && p < totalPages - 1 && Math.abs(p - page) > 1) {
        if (!pagDiv.lastChild || pagDiv.lastChild.textContent !== '…') {
          var s = document.createElement('span');
          s.textContent = ' … ';
          pagDiv.appendChild(s);
        }
        continue;
      }
      btn(String(p), p, false, p === page);
    }
    btn('Next', page + 1, page === totalPages);
  }
  render(1);
})();
});

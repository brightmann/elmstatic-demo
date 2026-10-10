// Post-build: split the post listing into /page/N URLs (5 posts/page).
// Runs after `elmstatic build`. Reads _site/index.html, extracts .post-item
// divs, and writes paginated copies with server-rendered pager links.
const fs = require("fs");
const path = require("path");

const PER_PAGE = 5;
const siteDir = path.join(__dirname, "..", "_site");

function paginateFile(relPath) {
  const filePath = path.join(siteDir, relPath);
  if (!fs.existsSync(filePath)) return;

  let html = fs.readFileSync(filePath, "utf8");

  // Extract post-item divs (non-greedy, they contain no nested divs with class post-item)
  const itemRe = /<div class="post-item">([\s\S]*?)<\/div>\s*(?=<div class="post-item">|<div id="pagination">)/g;
  const items = [];
  let m;
  // Simpler: split on the marker
  const listStart = html.indexOf('<div id="post-list">');
  const pagStart = html.indexOf('<div id="pagination">');
  if (listStart === -1 || pagStart === -1) return;
  const listHtml = html.slice(listStart, pagStart);
  const rawItems = listHtml.split('<div class="post-item">').slice(1).map(s => '<div class="post-item">' + s);

  const totalPages = Math.ceil(rawItems.length / PER_PAGE);
  if (totalPages <= 1) {
    // Single page: remove pagination div and script, keep all posts
    html = html.replace(/<div id="pagination"><\/div>/, "");
    html = html.replace(/<script src="\/pagination\.js"><\/script>/, "");
    fs.writeFileSync(filePath, html);
    return;
  }

  const baseDir = path.dirname(relPath); // "." for index.html, "posts" for posts/index.html
  const pageUrl = (p) => {
    const prefix = baseDir === "." ? "" : "/" + baseDir;
    return p === 1 ? prefix + "/" : prefix + "/page/" + p + "/";
  };

  function pagerHtml(current) {
    let h = '<div class="pager">';
    h += current > 1
      ? `<a href="${pageUrl(current - 1)}">Previous</a> `
      : `<span class="disabled">Previous</span> `;
    for (let p = 1; p <= totalPages; p++) {
      if (p === current) h += `<span class="current">${p}</span> `;
      else h += `<a href="${pageUrl(p)}">${p}</a> `;
    }
    h += current < totalPages
      ? `<a href="${pageUrl(current + 1)}">Next</a>`
      : `<span class="disabled">Next</span>`;
    h += "</div>";
    return h;
  }

  for (let p = 1; p <= totalPages; p++) {
    const pageItems = rawItems.slice((p - 1) * PER_PAGE, p * PER_PAGE).join("\n");
    let pageHtml = html.replace(
      /<div id="post-list">[\s\S]*?<div id="pagination"><\/div>/,
      `<div id="post-list">\n${pageItems}\n</div>\n${pagerHtml(p)}`
    );
    // Remove the client-side pagination script (we use real URLs now)
    pageHtml = pageHtml.replace(/<script src="\/pagination\.js"><\/script>/, "");

    if (p === 1) {
      fs.writeFileSync(filePath, pageHtml);
    } else {
      const outDir = path.join(siteDir, baseDir === "." ? "page" : path.join(baseDir, "page"), String(p));
      fs.mkdirSync(outDir, { recursive: true });
      fs.writeFileSync(path.join(outDir, "index.html"), pageHtml);
    }
  }
  console.log(`paginated ${relPath}: ${totalPages} pages`);
}

paginateFile("index.html");
paginateFile(path.join("posts", "index.html"));

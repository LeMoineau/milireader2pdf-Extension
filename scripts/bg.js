
const JOURNAL_KEY_BEGIN = "https://content.milibris.com/access/html5-reader/";
const JOURNAL_KEY_END = "/pages/jpeg/ld/";

var generationInProgressing = false
var currentPage = 0
var maxPage = 0
var cancelled = false

function cancel() {
  generationInProgressing = false
  currentPage = 0
  maxPage = 0
  cancelled = false
}

function getDataUri(url) {
    return new Promise(resolve => {
        var image = new Image();
        image.setAttribute('crossOrigin', 'anonymous');

        image.onload = function () {
            var canvas = document.createElement('canvas');
            canvas.width = this.naturalWidth;
            canvas.height = this.naturalHeight;

            var ctx = canvas.getContext('2d');
            ctx.fillStyle = '#fff';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            canvas.getContext('2d').drawImage(this, 0, 0);

            resolve(canvas.toDataURL('image/jpeg'));
        };

        image.src = url;
    })
}

async function generatePages(journal_key, material, callback_update) {
  generationInProgressing = true
  var first_hd = material.pages[0].hd;
  var doc = new jsPDF('p', 'px', [first_hd.width, first_hd.height]);

  var page_compteur = 1;
  maxPage = material.pages.length
  for (let page of material.pages) {
    var hd = page.hd;
    currentPage = page_compteur
    callback_update(page_compteur);

    var tile_width = hd.tile_height;
    for (let col = 0; col<hd.tile_col_count; col++) {
      if ((col+1) * hd.tile_width > hd.width) {
        tile_width = hd.width%hd.tile_width;
      }
      var tile_height = hd.tile_width;
      for (let row = 0; row<hd.tile_row_count; row++) {
        if (cancelled) {
          cancel()
          return
        }

        if ((row+1) * hd.tile_height > hd.height) {
          tile_height = hd.height%hd.tile_height;
        }

        let img_url = JOURNAL_KEY_BEGIN + journal_key + "/" + hd.path
          + `/tile${(col + "").padStart(2,'0')}x${(row + "").padStart(2,'0')}.jpeg`;
        console.log(img_url);
        var logo = await getDataUri(img_url);

        doc.addImage(logo, "JPEG", (hd.tile_width * col), (hd.tile_height * row),
          tile_width, tile_height);
        console.log(`row${row}, col${col}: width${tile_width}, height:${tile_height}`);
      }
    }

    page_compteur++;
    if (page_compteur <= material.pages.length) {
      doc.addPage();
    }
  }
  generationInProgressing = false
  doc.save(`${material.metadata.provider}_${material.metadata.publication_date}`);
}

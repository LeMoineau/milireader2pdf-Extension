
const JOURNAL_KEY_BEGIN = "https://content.milibris.com/access/html5-reader/";
const JOURNAL_KEY_END = "/pages/jpeg/ld/";

class Journal {

  key_find;
  journal_key;
  material;
  doc;

  constructor() {
    this.key_find = false;
    this.journal_key = "pas trouvé";
  }

  getJournalKey(all_html) {

    console.log("Journal key: ");
    if (all_html !== undefined && all_html.includes(JOURNAL_KEY_BEGIN) && all_html.includes(JOURNAL_KEY_END)) {
      this.journal_key = all_html.split(JOURNAL_KEY_BEGIN)[1].split(JOURNAL_KEY_END)[0];
      this.key_find = true;
    }
    console.log(this.getState());
    return this.getState();

  }

  getMaterialJSON(callback_error, callback_success) {
    if (this.key_find) {
      var url = JOURNAL_KEY_BEGIN + this.journal_key + "/material.json";
      fetch(url).then((result) => {
        if (result.status !== 200) {
          callback_error(result);
        } else {
          result.json().then((json) => {
            this.material = json;
            callback_success(json)
          });
        }
      });
    }
  }

  getDataUri(url) {
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

  async generatePages(callback_update) {
    var first_hd = this.material.pages[0].hd;
    this.doc = new jsPDF('p', 'px', [first_hd.width, first_hd.height]);

    var page_compteur = 1;
    for (let page of this.material.pages) {
      var hd = page.hd;
      callback_update(page_compteur);

      var tile_width = hd.tile_height;
      for (let col = 0; col<hd.tile_col_count; col++) {
        if ((col+1) * hd.tile_width > hd.width) {
          tile_width = hd.width%hd.tile_width;
        }
        var tile_height = hd.tile_width;
        for (let row = 0; row<hd.tile_row_count; row++) {
          if ((row+1) * hd.tile_height > hd.height) {
            tile_height = hd.height%hd.tile_height;
          }

          let img_url = JOURNAL_KEY_BEGIN + this.journal_key + "/" + hd.path
            + `/tile${(col + "").padStart(2,'0')}x${(row + "").padStart(2,'0')}.jpeg`;
          //console.log(img_url);
          var logo = await this.getDataUri(img_url);

          this.doc.addImage(logo, "JPEG", (hd.tile_width * col), (hd.tile_height * row),
            tile_width, tile_height);
          console.log(`row${row}, col${col}: width${tile_width}, height:${tile_height}`);
        }
      }

      page_compteur++;
      if (page_compteur <= this.material.pages.length) {
        this.doc.addPage();
      }
    }
    this.doc.save(`${this.material.metadata.provider}_${this.material.metadata.publication_date}`);
  }

  getState() {
    return {
      key_find: this.key_find,
      journal_key: this.journal_key
    }
  }

}

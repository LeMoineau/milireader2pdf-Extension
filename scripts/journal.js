
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

  getState() {
    return {
      key_find: this.key_find,
      journal_key: this.journal_key
    }
  }

}

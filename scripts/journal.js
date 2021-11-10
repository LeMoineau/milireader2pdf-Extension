
const JOURNAL_KEY_REGEX = "(https\:\/\/content.\.milibris\.com\/access\/html5\-reader\/.[^\/]*)\/pages\/jpeg\/ld\/"

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
    let reg = new RegExp(JOURNAL_KEY_REGEX);
    if (all_html !== undefined) {
      let result = all_html.match(reg);
      if (result !== null) {
        console.log(result)
        this.journal_key = result[1];
        this.key_find = true;
      }
    }
    console.log(this.getState());
    return this.getState();

  }

  getMaterialJSON(callback_error, callback_success) {
    if (this.key_find) {
      var url = this.journal_key + "/material.json";
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

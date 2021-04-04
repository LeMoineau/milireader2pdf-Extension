
var journal = new Journal();

window.onload = function () {

  generatePDF_button.onclick = () => {

    getTabHtml((all_html) => {
      statut_message.innerHTML = "";
      addTextToMessageDiv("lancement de la génération du pdf...");
      journal.getJournalKey(all_html);
      if (journal.key_find) {
        addTextToMessageDiv(`clé de journal trouvée: ${journal.journal_key}`, "green");
        journal.getMaterialJSON((result_error) => {
          if (result_error.status === 403) {
            addTextToMessageDiv("erreur obtention material.json: rafraichissez la page (F5)", "red");
          } else {
            addTextToMessageDiv(`erreur obtention material.json: ${result_error.status}`, "red");
          }

        },(result_json) => {
          console.log(result_json);
          addTextToMessageDiv(`material.json obtenu: journal du ${result_json.metadata.publication_localized_date}`, "green");
          progress_page_line = document.createElement("p");
          progress_page_line.classList.add("statut-message-line");
          progress_page_line.classList.add("green");
          pages_length = result_json.pages.length;
          statut_message.appendChild(progress_page_line);
          journal.generatePages((page) => {
            progress_page_line.textContent = `pages en cours de génération (${page}/${pages_length})`;
          });
        });
      } else {
        addTextToMessageDiv("clé de journal pas trouvée...", "red")
      }
    });

  }

}

function getTabHtml(callback) {

  chrome.tabs.executeScript({
      code: "(function() { return document.body.innerHTML; }) ()"
  }, (results) => {
      callback(results[0]);
  });

}

function addTextToMessageDiv(text, color) {
  line = document.createElement("p");
  line.classList.add("statut-message-line");
  if (color) {
    line.classList.add(color);
  }
  line.textContent = text;
  statut_message.appendChild(line);
}

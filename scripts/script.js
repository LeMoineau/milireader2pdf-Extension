
function getBgScript() {
  return chrome.extension.getBackgroundPage()
}

function generate2cancelButton() {
  generatePDF_button.classList.add("cancel")
  generatePDF_button.textContent = "Annuler la génération"
  generatePDF_button.onclick = function() {
    getBgScript().cancelled = true
    generatePDF_button.classList.remove("cancel")
    generatePDF_button.textContent = "Générer le PDF"
    statut_message.innerHTML = "";
    addTextToMessageDiv("Clique sur le bouton ci-dessus pour lancer la génération !");
    normalComportement()
  }
}

window.onload = function () {

  if (getBgScript().generationInProgressing) {
    generate2cancelButton()
    addTextToMessageDiv(`un journal est déjà en cours de création`, "green");
    progress_page_line = document.createElement("p");
    progress_page_line.classList.add("statut-message-line");
    progress_page_line.classList.add("green");
    statut_message.appendChild(progress_page_line);
    setInterval(function() {
      progress_page_line.textContent = `pages en cours de génération (${getBgScript().currentPage}/${getBgScript().maxPage})`;
    }, 500)
  } else {
    normalComportement()
  }

}

function normalComportement() {
  var journal = new Journal();

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
          getBgScript().generatePages(journal.journal_key, journal.material, (page) => {
            progress_page_line.textContent = `pages en cours de génération (${page}/${pages_length})`;
          });
          generate2cancelButton()
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

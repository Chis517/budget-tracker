const indexedDB =
  window.indexedDB ||
  window.mozIndexedDB ||
  window.webkitIndexedDB ||
  window.msIndexedDB ||
  window.shimIndexedDB;
  
let db;

const request = indexedDB.open('budget-tracker', 1);

request.onupgradeneeded = function(event) {
  const db = event.target.result; 
  db.createObjectStore('new_budget', { autoIncrement: true });
};

request.onsuccess = function(event) {
  db = event.target.result;

  if (navigator.onLine) {
    uploadData();
  }
};

request.onerror = function(event) {
  console.log(event.target.errorCode);
};

function saveRecord(record) {
  const transaction = db.transaction(['new_budget'], 'readwrite');

  const budgetObjectStore = transaction.objectStore('new_budget');

  budgetObjectStore.add(record);
}

function uploadData() {
  const transaction = db.transaction(['new_budget'], 'readwrite');

  const budgetObjectStore = transaction.objectStore('new_budget');

  const uploadAll = budgetObjectStore.getAll();

  uploadAll.onSuccess = function() {
    if (uploadAll.result.length > 0) {
      fetch("/api/transaction/", {
        method: "POST",
        body: JSON.stringify(uploadAll.result),
        headers: {
          Accept: "application/json, text/plain, */*",
          "Content-Type": "appication/json"
        }
      })
      .then(response => response.json())
      .then(serverResponse => {
        if (serverResponse.message){
          throw new Error(serverResponse);
        }
        const transaction = db.transaction(['new_budget'], 'readwrite');

        const budgetObjectStore = transaction.objectStore('new_budget');
        
        budgetObjectStore.clear();

        alert('All saved transactions submitted!')
      })
      .catch(err => {
        console.log(err);
      });
    }
  }
};

window.addEventListener('online', uploadData)
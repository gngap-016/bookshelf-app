const books = [];
const RENDER_EVENT = 'render-book';
const SAVED_EVENT = 'saved-book';
const STORAGE_KEY = 'BOOK_SHELF';

function isStorageExist() {
    if (typeof (Storage) === undefined) {
        alert('Browser kamu tidak mendukung local storage');
        return false;
    }
    return true;
}

function generateID() {
    return +new Date();
}

function generateBookObject(id, title, author, year, isCompleted) {
    return {id, title, author, year, isCompleted};
}

function loadBook() {
    const serializedData = localStorage.getItem(STORAGE_KEY);
    let data = JSON.parse(serializedData);
    
    if (data !== null) {
      for (const book of data) {
            books.push(book);
      }
    }
   
    document.dispatchEvent(new Event(RENDER_EVENT));
}

function findBook(bookID) {
    for (const bookItem of books) {
        if (bookItem.id === bookID) {
            return bookItem;
        }
    }
    return null;
}

function findBookIndex(bookID) {
    for (const index in books) {
      if (books[index].id === bookID) {
        return index;
      }
    }
    return -1;
}

function makeBook(bookObject) {
    const {id, title, author, year, isCompleted} = bookObject;

    const bookTitle = document.createElement('h3');
    bookTitle.innerText = title;

    const bookAuthor = document.createElement('p');
    bookAuthor.innerText = 'Penulis : ' + author;

    const bookYear = document.createElement('h4');
    bookYear.innerText = 'Terbit : ' + year;

    const bookContainer = document.createElement('article');
    bookContainer.classList.add('book-item');
    bookContainer.setAttribute('id', `book-${id}`);
    bookContainer.append(bookTitle, bookAuthor, bookYear);
    
    const bookAction = document.createElement('div');
    bookAction.classList.add('action');

    const deleteButton = document.createElement('button');
    deleteButton.classList.add('btn-red');
    deleteButton.innerText = 'Hapus Buku';
    deleteButton.addEventListener('click', function() {
        if(confirm('Anda Yakin?')) {
            deleteBook(id);
        }
    });

    const clear = document.createElement('div');
    clear.classList.add('clear');

    if(isCompleted) {
        const undoButton = document.createElement('button');
        undoButton.classList.add('btn-success');
        undoButton.innerText = ' Belum Selesai Baca';
        undoButton.addEventListener('click', () => undoBookFromCompleted(id));
        
        bookAction.append(undoButton, deleteButton);
        bookContainer.append(bookAction, clear);
    } else {
        const checkButton = document.createElement('button');
        checkButton.classList.add('btn-success');
        checkButton.innerText = 'Selesai Baca';
        checkButton.addEventListener('click', () => addBookToCompleted(id));
        
        bookAction.append(checkButton, deleteButton);
        bookContainer.append(bookAction, clear);
    }

    return bookContainer;
}

function saveData() {
    if(isStorageExist()) {
        const parsed = JSON.stringify(books);
        localStorage.setItem(STORAGE_KEY, parsed);
        document.dispatchEvent(new Event(SAVED_EVENT));
    }
}

const bookCompleted = document.getElementById('inputBookIsComplete');
bookCompleted.addEventListener('click', function isCompletedBook() {
    const buttonLabel = document.querySelector('span');
    if(bookCompleted.checked) {
        buttonLabel.innerText = '"Selesai Baca"';
    } else {
        buttonLabel.innerText = '"Belum Selesai Baca"';
    }
})

function addBook() {
    let bookTitle = document.getElementById('inputBookTitle');
    let bookAuthor = document.getElementById('inputBookAuthor');
    let bookYear = document.getElementById('inputBookYear');

    let isCompleted = false;
    if(bookCompleted.checked) {
        isCompleted = true;
    }

    const generatedID = generateID();
    const bookObject = generateBookObject(  generatedID, 
                                            bookTitle.value, 
                                            bookAuthor.value, 
                                            bookYear.value, 
                                            isCompleted
                                          );
    books.push(bookObject);
    document.dispatchEvent(new Event(RENDER_EVENT));
    saveData();

    alert('Buku Berhasil di Tambahkan');
    bookTitle.value = '';
    bookAuthor.value = '';
    bookYear.value = '';
}

function addBookToCompleted(bookID) {
    const bookTarget = findBook(bookID);
    if(bookTarget == null) return;

    bookTarget.isCompleted = true;
    document.dispatchEvent(new Event(RENDER_EVENT));
    saveData();
}

function undoBookFromCompleted(bookID) {
    const bookTarget = findBook(bookID);
    if(bookTarget == null) return;

    bookTarget.isCompleted = false;
    document.dispatchEvent(new Event(RENDER_EVENT));
    saveData();
}

function deleteBook(bookID) {
    const bookTarget = findBookIndex(bookID);
    if(bookTarget === -1) return;

    books.splice(bookTarget, 1);
    document.dispatchEvent(new Event(RENDER_EVENT));
    saveData();
}

document.addEventListener('DOMContentLoaded', function () {
    const submitForm = document.getElementById('input-book');
  
    submitForm.addEventListener('submit', function (event) {
        event.preventDefault();
        addBook();
    });
 
    if (isStorageExist()) {
        loadBook();
    }
});

document.addEventListener(RENDER_EVENT, function () {
    const incompleteBookList = document.getElementById('incompleteBookList');
    const completeBookList = document.getElementById('completeBookList');
  
    // clearing list item
    incompleteBookList.innerHTML = '';
    completeBookList.innerHTML = '';

    for (const bookItem of books) {
      const bookElement = makeBook(bookItem);
      if (bookItem.isCompleted) {
        completeBookList.append(bookElement);
      } else {
        incompleteBookList.append(bookElement);
      }
    }
});

document.addEventListener(SAVED_EVENT, function () {
   console.log(localStorage.getItem(STORAGE_KEY));
});


const searchForm = document.getElementById('search-book');
searchForm.addEventListener('submit', function(e) {
    e.preventDefault();
    const incompleteBookList = document.getElementById('incompleteBookList');
    const completeBookList = document.getElementById('completeBookList');
    const inputTitleSearch = document.getElementById('searchBookTitle').value;

    // clearing list item
    incompleteBookList.innerHTML = '';
    completeBookList.innerHTML = '';

    const result = books.filter((book) => {
        // Kita lowercase semua agar case menjadi sama,
        // Sehingga hasil pencarian menjadi ignoring case.
        const bookTitle = book.title.toLowerCase();
        const searchKeyword = inputTitleSearch.toLowerCase();
    
        return bookTitle.includes(searchKeyword);
    });
    // console.log(result);
    if(result.length === 0 ) {
        incompleteBookList.innerHTML = 'Hasil tidak ditemukan';
        completeBookList.innerHTML = 'Hasil tidak ditemukan';
    } else {
        for (const bookItem of result) {
            const bookElement = makeBook(bookItem);
            if (bookItem.isCompleted) {
                completeBookList.append(bookElement);
            } else {
                incompleteBookList.append(bookElement);
            }
        }
    }

});

const btnShowBookList = document.getElementById('buttonShowBookList');
btnShowBookList.addEventListener('click', () => {
    document.dispatchEvent(new Event(RENDER_EVENT));
    document.getElementById('searchBookTitle').value = '';
});
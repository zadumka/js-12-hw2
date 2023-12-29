import iziToast from 'izitoast';
import 'izitoast/dist/css/iziToast.min.css';
import axios from 'axios';

import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';

const refs = {
  input: document.querySelector('[type="text"]'),
  searchBtn: document.querySelector('[type="submit"]'),
  gallery: document.querySelector('.gallery'),
  loadBtn: document.querySelector('.js-load'),
  loadDiv: document.querySelector('.js-loader'),
};

const params = {
  API_KEY: '41227446-81114c3a771220f4777577230',
};
axios.defaults.baseURL = 'https://pixabay.com/api/';

let currentPage = 1;
const per_page = 40;
let lightbox = new SimpleLightbox('.gallery a');

async function getGaleryItems(page = currentPage) {
  const data = await axios
    .get(
      `?key=${params.API_KEY}&q=${refs.input.value}&image_type=photo&orientation=horizontal&safesearch=true&page=${page}&per_page=${per_page}`
    )
    .then(resp => resp.data)
    .catch(err => console.error(err));
  return data;
}

refs.searchBtn.addEventListener('click', onSearch);
refs.loadBtn.addEventListener('click', onClick);

function onSearch(e) {
  e.preventDefault();
  currentPage = 1;

  if (refs.input.value.trim() === '') {
    return iziToast.error({
      message: 'Sorry, the field must be filled in!',
      position: 'topRight',
    });
  } else {
    refs.gallery.innerHTML = '<span class="loader"></span>';
  }
  getGaleryItems()
    .then(data => {
      refs.gallery.innerHTML = createMarkup(data.hits);
      lightbox.refresh();

      if (per_page >= data.totalHits) {
        refs.loadBtn.hidden = true;
      } else {
        refs.loadBtn.hidden = false;
      }
    })
    .catch(err => console.error(err));
}

function onClick(e) {
  e.preventDefault();
  currentPage += 1;

  refs.loadDiv.innerHTML = '<span class="loader"></span>';
  refs.loadBtn.hidden = true;

  getGaleryItems(currentPage).then(data => {
    refs.gallery.insertAdjacentHTML('beforeend', createMarkup(data.hits));
    lightbox.refresh();

    if (data.totalHits / per_page <= currentPage) {
      refs.loadBtn.hidden = true;
      refs.loadDiv.innerHTML = '';
      return iziToast.info({
        message: "We're sorry, but you've reached the end of search results.",
        position: 'topRight',
      });
    } else if (data.totalHits / per_page >= currentPage) {
      refs.loadDiv.innerHTML = '';
      refs.loadBtn.hidden = false;
    }

    const galeryItem = document.querySelector('.gallery-item');
    let rect = galeryItem.getBoundingClientRect();
    scrollBy({
      top: rect.height * 3,
      behavior: 'smooth',
    });
  });
}

function createMarkup(arr) {
  if (arr.length === 0) {
    iziToast.error({
      message:
        'Sorry, there are no images matching <br> your search query. Please try again!',
      position: 'topRight',
    });
  }
  return arr
    .map(
      ({
        webformatURL,
        largeImageURL,
        tags,
        likes,
        views,
        comments,
        downloads,
      }) => {
        return `
    <li class='gallery-item'>
        <a href='${largeImageURL}'>
            <img src="${webformatURL}" alt="${tags}" data-source=${largeImageURL} class='gallery-img'/>
        </a>
        <div class='text-container'>
            <p>Likes<span>${likes}</span></p>
            <p>Views<span>${views}</span></p>
            <p>Comments<span>${comments}</span></p>
            <p>Downloads<span>${downloads}</span></p>
        </div>
    </li>`;
      }
    )
    .join('');
}

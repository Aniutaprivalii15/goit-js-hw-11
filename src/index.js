import('./css/styles.css');
import { fetchImages } from './js/fetch-images';
import { renderGallery } from './js/render-gallery';
import { onScroll, onToTopBtn } from './js/scroll';
import Notiflix from 'notiflix';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';

const searchForm = document.querySelector('#search-form');
const gallery = document.querySelector('.gallery');
const loadMoreBtn = document.querySelector('.btn-load-more');
const endCollectionText = document.querySelector('.end-collection-text');
let query = '';
let page = 1;
let currentHits = 0;
// let simpleLightBox;
const perPage = 40;

let lightbox = new SimpleLightbox('.photo-card a', {
  captions: true,
  captionsData: 'alt',
  captionDelay: 250,
});

searchForm.addEventListener('submit', onSearchForm);
loadMoreBtn.addEventListener('click', onLoadMoreBtn);

onScroll();
onToTopBtn();


function onSearchForm(e) {
  e.preventDefault();
  window.scrollTo({ top: 0 });
  page = 1;
  query = e.currentTarget.searchQuery.value;
  gallery.innerHTML = '';
  loadMoreBtn.classList.add('is-hidden');

  if (query === '') {
    alertNoEmptySearch();
    return;
  }

  fetchImages(query, page, perPage)
    .then(({ data }) => {
      if (data.totalHits === 0) {
        alertNoImagesFound()
      } 
      else {
        renderGallery(data.hits)
        lightbox.refresh();
        alertImagesFound(data)

        if (data.totalHits > perPage) {
          loadMoreBtn.classList.remove('is-hidden')
        }
      }
    })
    .catch(error => console.log(error))
}
// let lightbox = new SimpleLightbox('.gallery a')
  
async function onLoadMoreBtn() {
  page += 1;
  const response = await fetchImages(query, page, perPage);
  renderGallery(response.data.hits);
  lightbox.refresh();
  currentHits += response.hits.length;

  if (currentHits === response.totalHits) {
    loadMoreBtn.classList.add('is-hidden');
    endCollectionText.classList.remove('is-hidden');
  }
}


//   fetchImages(query, page, perPage)
//     .then(({ data }) => {
//       renderGallery(data.hits)
//       simpleLightBox = new SimpleLightbox('.gallery a').refresh()

//       const totalPages = Math.ceil(data.totalHits / perPage)

//       if (page > totalPages) {
//         loadMoreBtn.classList.add('is-hidden')
//         alertEndOfSearch()
//       }
//     })
//     .catch(error => console.log(error))
// }

function alertImagesFound(data) {
  Notiflix.Notify.success(`Hooray! We found ${data.totalHits} images.`)
}

function alertNoEmptySearch() {
  Notiflix.Notify.failure('The search string cannot be empty. Please specify your search query.')
}

function alertNoImagesFound() {
  Notiflix.Notify.failure('Sorry, there are no images matching your search query. Please try again.')
}

function alertEndOfSearch() {
  Notiflix.Notify.failure("We're sorry, but you've reached the end of search results.")
}

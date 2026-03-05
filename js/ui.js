<<<<<<< HEAD
let selectedCard = null;

export function initUI(){
  document.getElementById("addBtn").style.display = "inline-block";
  document.getElementById("updateBtn").style.display = "none";
}

export function highlightCard(id){

  const cards = document.querySelectorAll("#eventsList .card");

  cards.forEach(card=>{

    if(card.dataset.id === id){

      if(selectedCard) selectedCard.classList.remove("selected");

      card.classList.add("selected");
      selectedCard = card;

      card.scrollIntoView({
        behavior:"smooth",
        block:"center"
      });

    }

  });

=======
let selectedCard = null;

export function initUI(){
  document.getElementById("addBtn").style.display = "inline-block";
  document.getElementById("updateBtn").style.display = "none";
}

export function highlightCard(id){

  const cards = document.querySelectorAll("#eventsList .card");

  cards.forEach(card=>{

    if(card.dataset.id === id){

      if(selectedCard) selectedCard.classList.remove("selected");

      card.classList.add("selected");
      selectedCard = card;

      card.scrollIntoView({
        behavior:"smooth",
        block:"center"
      });

    }

  });

>>>>>>> fcda53b8105f9871b9706217fffbb0d0338283dd
}
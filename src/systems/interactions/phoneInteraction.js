
let contactCardLoaded = false;

export default async function onPhoneClick() {
  console.log('☎ Telephone clicked!');

  if (!contactCardLoaded) {
    await loadContactCard();
  }

  // Toggle visibility
  toggleContactCardVisibility();

}

async function loadContactCard() {
    const res = await fetch('../../../html/contactCard.html');
    const html = await res.text();
    document.body.insertAdjacentHTML('beforeend', html);

    // Load CSS only once
    if (!document.querySelector('link[href="../../../html/contactCard.css"]')) {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = 'html/contactCard.css';
        document.head.appendChild(link);
    }

    contactCardLoaded = true;
}

function toggleContactCardVisibility() {
      const contactCard = document.getElementById('contactCard');
      if (!contactCard) return;
    
      contactCard.classList.toggle('hidden');
}


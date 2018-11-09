/**
 * Enables toggling of Bulma navbar
 * This is a simple function that thinks that we must only have a single navbar in a document
 * https://bulma.io/documentation/components/navbar/#navbar-menu
 */
export function enableNavbarToggle() {
  const navbarBurgerElt = document.querySelector(".navbar-burger");
  if (navbarBurgerElt) {
    navbarBurgerElt.addEventListener("click", function() {
      toggleMainNavbar();
    });
  }
}

export function toggleMainNavbar() {
  const navbarBurgerElt = document.querySelector(".navbar-burger");
  if (navbarBurgerElt) {
    const targetId =
      navbarBurgerElt.getAttribute("data-target") || "navbarBasicExample";
    const targetElt = document.getElementById(targetId);
    if (targetElt) {
      targetElt.classList.toggle("is-active");
      navbarBurgerElt.classList.toggle("is-active");
    }
  }
}

export function triggerModal(id: string) {
  const modalElt = document.getElementById(id);
  if (modalElt) {
    modalElt.classList.toggle("is-active");
    const backgroundElt = modalElt.querySelector(".delete");
    if (backgroundElt) {
      (backgroundElt as HTMLElement).onclick = function() {
        triggerModal(id);
      };
    }
  }
}

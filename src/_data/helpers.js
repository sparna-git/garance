module.exports = {
  /**
   * Renvoyer la date courante pour affichage dans le footer
   **/
  currentDate() {
    const today = new Date();
    return today.toLocaleDateString();
  }
};
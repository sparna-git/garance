module.exports = {
  /**
   * Renvoyer la date courante pour affichage dans le footer
   **/
  currentDateTime() {
    const today = new Date();
    return (today.toLocaleDateString()+" "+today.toLocaleTimeString());
  }
};
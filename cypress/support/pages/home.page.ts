export class HomePage {
    private title() { return cy.get('[data-test="home-title"]'); }
  
    getTitle() {
      return this.title().invoke('text');
    }
  }
  
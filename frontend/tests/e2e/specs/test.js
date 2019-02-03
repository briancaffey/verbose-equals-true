// https://docs.cypress.io/api/introduction/api.html

describe('Test Home Page', () => {
  it('Visits home page', () => {
    cy.visit('/login');
    cy.contains('h1', 'Sign In');
  });
});

describe('Test Login', () => {
  it('Can Login', () => {
    cy.server();
    cy.route({
      method: 'POST',
      url: '/api/auth/obtain_token/',
      response: {
        token: 'my.jwt.token',
      },
    });

    cy.fixture('demo1.png').as('profile');
    cy.route({
      method: 'GET',
      url: '/api/account/',
      response: 'fx:profile.json',
    });
    cy.route('**/media/demo1.png', 'fx:demo1.png');


    cy.fixture('demo1.png').then((img) => {
      cy.route({
        method: 'GET',
        response: img,
        status: 200,
        url: '**/media/demo1.png',
      });
    });
    cy.fixture('demo1.png').as('profile');
    cy.route('GET', '**/media/demo1.png', '@profile');
    cy.visit('/login');
    cy.get('#login').clear();
    cy.get('#login').type('brian');
    cy.get('#password').clear();
    cy.get('#password').type('asdfghjkl');
    cy.get('#login-button').click();
  });
});

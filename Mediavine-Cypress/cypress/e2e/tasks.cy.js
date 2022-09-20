describe("Quick Cypress Automation Tasks", () => {
  const pageUrl = "https://the-internet.herokuapp.com";

  it("Validates basic auth", () => {
    cy.visit(`${pageUrl}/basic_auth`, {
      headers: {
        authorization: "Basic YWRtaW46YWRtaW4=",
      },
      failOnStatusCode: false,
    });
    cy.contains("Basic Auth").should("exist");
  });

  it("Validates login", () => {
    cy.visit(`${pageUrl}/login`);
    cy.get("#username").type("tomsmith");
    cy.get("#password").type("SuperSecretPassword!");
    cy.get("button[type='submit']").click();
    cy.get("a[href='/logout']").should("exist");
  });

  it("Checks for broken images (Expected to Fail)", () => {
    cy.visit(`${pageUrl}/broken_images`);
    cy.get("img").each((img) => {
      cy.wrap(img)
        .should("have.attr", "src")

        .then((src) => {
          // This test should fail here as the images are actually broken
          cy.request(`${pageUrl}/${src}`);
        });
    });
  });

  describe("Console error tests", () => {
    let errorCount = 0;
    Cypress.on("uncaught:exception", (err, runnable) => {
      if (err) errorCount++;
      return false;
    });
    it("Checks for console error", () => {
      cy.visit(`${pageUrl}/javascript_error`).then(() => {
        expect(errorCount).to.not.equal(0);
      });
    });
  });

  it("Downloads 5 separate files locally", () => {
    const downloadFolder = "cypress/downloads";

    cy.visit(`${pageUrl}/download`);

    cy.get("a").then(() => {
      const indices = [2, 4, 6, 8, 10];

      // Download and check if the file exists
      indices.forEach((index) => {
        cy.get("a")
          .eq(index)
          .each((element) => {
            cy.wrap(element)
              .should("have.attr", "href")
              .then((href) => {
                cy.downloadFile(
                  `${pageUrl}/${href}`,
                  downloadFolder,
                  element.text()
                );
                cy.readFile(`${downloadFolder}/${element.text()}`).should(
                  "not.be.empty"
                );
              });
          });
      });
    });
  });

  it("Validates the presence of each DOM element", () => {
    cy.visit("https://the-internet.herokuapp.com/challenging_dom");

    // Getting the buttons
    cy.get('[class$="button"]').should("have.length", 1).and("exist");
    cy.get(".button.alert").should("have.length", 1).and("exist");
    cy.get(".button.success").should("have.length", 1).and("exist");

    // Getting all of the elements in the table
    cy.get("th")
      .should("have.length", 7)
      .each((element) => {
        expect(element).to.exist;
      });

    let index = 0;
    cy.get("td")
      .should("have.length", 70)
      .each((element) => {
        expect(element).to.exist;
        index++;
        if (index % 7 === 0) {
          cy.wrap(element).within(() => {
            cy.get("a").each((link) => {
              expect(link).to.have.attr("href");
            });
          });
        }
      });

    // Getting the canvas answer
    let answer = "";
    cy.get("script")
      .each((el) => {
        const text = el.text();
        if (text.search("Answer")) {
          const match = text.match(/\d{5}/g);
          if (match) {
            answer = match[0];
          }
        }
      })
      .then(() => {
        expect(answer).to.not.be.null;
      });
  });
});

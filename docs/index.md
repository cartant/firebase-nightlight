`firebase-nightlight` is an in-memory, JavaScript mock for the Firebase Web API.

## Example

```ts
import * as firebase from "firebase/app";
import { expect } from "chai";
import { Mock } from "firebase-nightlight";

describe("something", () => {

    let mockDatabase: any;
    let mockApp: firebase.app.App;

    beforeEach(() => {

        mockDatabase = {
            content: {
                lorem: "ipsum"
            }
        };
        const mock = new Mock({
            database: mockDatabase,
            identities: [{
                email: "alice@firebase.com",
                password: "wonderland"
            }]
        });
        mockApp = mock.initializeApp({});
    });

    it("should do something with the mock", () => {

        return mockApp
            .auth()
            .signInWithEmailAndPassword("alice@firebase.com", "wonderland")
            .then((user) => {

                expect(user).to.exist;
                expect(user).to.have.property("email", "alice@firebase.com");
                expect(user).to.have.property("uid");

                return mockApp
                    .database()
                    .ref()
                    .once("value");
            })
            .then((snapshot) => {

                expect(snapshot.val()).to.deep.equal({ lorem: "ipsum" });

                return mockApp
                    .database()
                    .ref()
                    .update({ lorem: "something else" });
            })
            .then(() => {

                expect(mockDatabase.content).to.deep.equal({ lorem: "something else" });

                return mockApp
                    .auth()
                    .signOut();
            });
    });
});
```

<script>
    (function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
    (i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
    m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
    })(window,document,'script','https://www.google-analytics.com/analytics.js','ga');
    ga('create', 'UA-103034213-2', 'auto');
    ga('send', 'pageview');
</script>

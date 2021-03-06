import Head from "next/head";
import styles from "../styles/Home.module.css";
import React from "react";
import Dashboard from "../components/Dashboard";
import SignIn from "../components/SignIn";
import { auth, createUserProfileDocument } from "../firebase/firebase.utils";

export default class Home extends React.Component {
  constructor() {
    super();
    this.state = {
      currentUser: null,
    };
  }

  unsubscribeFromAuth = null;
  componentDidMount() {
    this.unsubscribeFromAuth = auth.onAuthStateChanged(async (userAuth) => {
      if (userAuth) {
        const userRef = await createUserProfileDocument(userAuth);

        userRef.onSnapshot((snapShot) => {
          this.setState({
            currentUser: {
              id: snapShot.id,
              ...snapShot.data(),
            },
          });
        });
      } else {
        this.setState({ currentUser: userAuth });
      }
    });
  }
  componentWillUnmount() {
    this.unsubscribeFromAuth();
  }

  render() {
    return (
      <div className={styles.container}>
        <Head>
          <title>Year Tracker</title>
          <meta name="author" content="T. Potter"></meta>
          <meta
            name="viewport"
            content="width=device-width, initial-scale=1.0"
          ></meta>
          <link rel="icon" href="/favicon.ico" />
          <link
            rel="stylesheet"
            href="https://fonts.googleapis.com/css?family=Montserrat"
          />
          <meta name="twitter:card" content="summary_large_image" />

          <meta name="twitter:title" content="Exercise Tracker" />
          <meta
            name="twitter:description"
            content="Track and view your workout's throughout the year in a simple pixelated view!"
          />
          <meta
            name="twitter:image"
            content="https://www.pixelatedyear.com/twitterpreview.png"
          />
        </Head>
        <main className={styles.main}>
          {this.state.currentUser ? (
            <Dashboard user={this.state.currentUser} />
          ) : (
            <SignIn />
          )}
        </main>
      </div>
    );
  }
}

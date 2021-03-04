import React, { Component } from "react";
import axios from "axios";
import Joke from "./Joke";
import "./JokeList.css";
let API_BASE_URL = "https://icanhazdadjoke.com/";

class JokeList extends Component {
  static defaultProps = {
    numJokesToGet: 10
  };
  constructor(props) {
    super(props);

    this.state = {
      hasError: false,
      jokes: JSON.parse(window.localStorage.getItem("jokes") || "[]"),
      loading: false
    };
    this.seenJokes = new Set(this.state.jokes.map((j) => j.id));
    this.handleClick = this.handleClick.bind(this);
  }

  componentDidMount() {
    if (this.state.jokes.length === 0) {
      this.setState({ loading: true });
      this.getJokes();
    }
  }
  async getJokes() {
    try {
      let jokes = [];
      while (jokes.length < this.props.numJokesToGet) {
        let res = await axios.get(`${API_BASE_URL}`, {
          headers: { Accept: "application/json" }
        });
        let joke = await res.data;
        let isUnique = this.seenJokes.has(joke.id);
        if (!isUnique) {
          jokes.push({ id: joke.id, text: joke.joke, votes: 0 });
          this.seenJokes.add(joke.id);
        } else {
          console.log("found duplicate");
          console.log(joke);
        }
      }
      this.setState(
        (st) => ({
          jokes: [...st.jokes, ...jokes],
          loading: false
        }),
        () =>
          window.localStorage.setItem(
            "jokes",
            JSON.stringify(this.state.jokes)
          ),
        () => (this.seenJokes = new Set(this.state.jokes.map((j) => j.id)))
      );
    } catch (e) {
      alert(e);
      this.setState({ loading: false });
    }
  }

  handleVote(id, delta) {
    this.setState(
      (st) => ({
        jokes: st.jokes.map((j) =>
          j.id === id ? { ...j, votes: j.votes + delta } : j
        )
      }),
      () =>
        window.localStorage.setItem("jokes", JSON.stringify(this.state.jokes))
    );
  }
  async handleClick() {
    this.setState({ loading: true }, this.getJokes);
  }
  render() {
    let loading = (
      <div className="JokeList-spinner">
        <i className="fa fa-spinner fa-8x fa-spin "></i>
        <h1>Loading...</h1>
      </div>
    );
    let sorted = this.state.jokes.sort((a, b) => b.votes - a.votes);
    let jokeList = sorted.map((j) => (
      <Joke
        key={j.id}
        votes={j.votes}
        text={j.text}
        upvote={() => this.handleVote(j.id, 1)}
        downvote={() => this.handleVote(j.id, -1)}
      />
    ));
    return (
      <div className="JokeList">
        <div className="JokeList-sidebar">
          <h1 className="JokeList-title">
            <span>Dad</span> Jokes
          </h1>
          <img
            src="https://assets.dryicons.com/uploads/icon/svg/8927/0eb14c71-38f2-433a-bfc8-23d9c99b3647.svg"
            alt="Laughing Emoji"
          />
          <button className="JokeList-title" onClick={this.handleClick}>
            New Jokes
          </button>
        </div>
        <div className="JokeList-jokes">
          {this.state.loading ? loading : jokeList}
        </div>
      </div>
    );
  }
}

export default JokeList;

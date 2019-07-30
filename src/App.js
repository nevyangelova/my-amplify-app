import React, { useEffect, useReducer } from "react";
import logo from "./logo.svg";
import "./App.css";
import { withAuthenticator } from "aws-amplify-react";
import { API, graphqlOperation } from "aws-amplify";
import { listObj } from "./graphql/queries";
import uuid from "uuid/v4";

const initialState = {
  name: "",
  price: "",
  symbol: "",
  objs: []
};

// create reducer
function reducer(state, action) {
  switch (action.type) {
    case "SET_INPUT":
      return { ...state, [action.inputName]: action.inputValue };
    default:
      return state;
  }
}

function App() {
  const [state, dispatch] = useReducer(reducer, initialState);

  async function getData() {
    try {
      const nevysData = await API.graphql(graphqlOperation(listObj));
      console.log("data from API: ", nevysData);
    } catch (err) {
      console.log("error fetching data..", err);
    }
  }

  async function createObj() {
    const { name, price, symbol } = state;
    if (name === "" || price === "" || symbol === "") return;
    const obj = {
      name,
      price,
      symbol,
      clientId: uuid()
    };
    const objs = [...state.objs, obj];
    dispatch({ type: "SETCOINS", objs });
    console.log("obj:", obj);

    try {
      await API.graphql(graphqlOperation(createObj, { input: obj }));
      console.log("item created!");
    } catch (err) {
      console.log("error creating obj...", err);
    }
  }

  function onChange(e) {
    dispatch({
      type: "SET_INPUT",
      inputName: e.target.name,
      inputValue: e.target.value
    });
  }

  useEffect(() => {
    getData();
  }, []);

  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
      </header>
      <input
        name="username"
        placeholder="username"
        value={state.username}
        onChange={onChange}
      />
      <button onClick={createObj}>Create Coin</button>

      <div>
        {state.objs.map((c, i) => (
          <div key={i}>
            <h2>{c.name}</h2>
            <h4>{c.symbol}</h4>
            <p>{c.price}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default withAuthenticator(App, { includeGreetings: true });

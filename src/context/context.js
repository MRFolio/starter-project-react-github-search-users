import React, { useState, useEffect, createContext } from "react";
import mockUser from "./mockData.js/mockUser";
import mockRepos from "./mockData.js/mockRepos";
import mockFollowers from "./mockData.js/mockFollowers";
import axios from "axios";
import { MdRateReview } from "react-icons/md";

const rootUrl = "https://api.github.com";

const GithubContext = createContext();

const GithubProvider = ({ children }) => {
  const [githubUser, setGithubUser] = useState(mockUser);
  const [repos, setRepos] = useState(mockRepos);
  const [followers, setFollowers] = useState(mockFollowers);
  const [requests, setRequests] = useState(0);
  const [loading, setLoading] = useState(false);
  //error
  const [error, setError] = useState({ show: false, msg: "" });

  function toggleError(show = false, msg = "") {
    setError({ show, msg });
  }

  const searchGithubUser = async (user) => {
    toggleError();
    setLoading(true);
    try {
      const response = await fetch(`${rootUrl}/users/${user}`);
      const data = await response.json();

      if (data) {
        setGithubUser(data);
        const { login, followers_url } = data;
        const fetcMore = async () => {
          const response2 = await fetch(
            `${rootUrl}/users/${login}/repos?per_page=100`
          );
          const data2 = await response2.json();
          setRepos(data2);
        };
        fetcMore();

        const fetchMore2 = async () => {
          const response3 = await fetch(`${followers_url}?per_page=100`);
          const data3 = await response3.json();
          setFollowers(data3);
        };
        fetchMore2();
      } else {
        toggleError(true, "there is no user with that username");
      }
    } catch (error) {
      console.log(error);
    } finally {
      checkRequests();
      setLoading(false);
    }
  };

  const checkRequests = async () => {
    try {
      const response = await fetch(`${rootUrl}/rate_limit`);
      const {
        rate: { remaining },
      } = await response.json();

      if (remaining === 0) {
        toggleError(true, "sorry");
        // error
      }
      setRequests(remaining);
    } catch (error) {}
  };
  useEffect(() => {
    checkRequests();
  }, []);

  return (
    <GithubContext.Provider
      value={{
        githubUser,
        repos,
        followers,
        requests,
        error,
        searchGithubUser,
        loading,
      }}
    >
      {children}
    </GithubContext.Provider>
  );
};

export { GithubContext, GithubProvider };
